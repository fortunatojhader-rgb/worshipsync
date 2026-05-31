-- Atualiza a função principal do Algoritmo de Escala para considerar apenas os últimos 60 dias
create or replace function public.generate_event_scale(target_event_id uuid)
returns void language plpgsql security definer as $$
declare
    v_group_id uuid;
    v_event_date date;
    v_formation jsonb;
    v_instrument_name text;
    v_required_count int;
    v_member_id uuid;
begin
    -- 1. Obter informações do evento e a formação padrão do grupo
    select group_id, event_date::date into v_group_id, v_event_date
    from public.events where id = target_event_id;

    select default_formation into v_formation
    from public.groups where id = v_group_id;

    -- Limpa escala existente para este evento
    delete from public.schedules where event_id = target_event_id;

    -- 2. Iterar sobre cada instrumento na formação padrão
    for v_instrument_name, v_required_count in select * from jsonb_each_text(v_formation)
    loop
        -- 3. Buscar os melhores candidatos para este instrumento
        for v_member_id in (
            with candidate_pool as (
                select 
                    gm.id as member_id,
                    mi.level,
                    -- Contagem de vezes que foi escalado APENAS nos últimos 60 dias
                    (
                      select count(*) 
                      from public.schedules s 
                      join public.events e on e.id = s.event_id
                      where s.group_member_id = gm.id 
                        and s.instrument = v_instrument_name
                        and e.event_date >= (now() - interval '60 days')
                    ) as times_scaled_recent,
                    public.get_member_acceptance_rate(gm.id) as acceptance_rate
                from public.group_members gm
                join public.member_instruments mi on mi.group_member_id = gm.id
                where gm.group_id = v_group_id
                  and mi.instrument = v_instrument_name
                  -- Filtro de Disponibilidade
                  and not exists (
                      select 1 from public.availability_blocks ab 
                      where ab.group_member_id = gm.id 
                        and (
                            (ab.type = 'once' and ab.date = v_event_date) or
                            (ab.type = 'period' and v_event_date between ab.start_date and ab.end_date)
                        )
                  )
                  -- Não estar escalado já neste evento
                  and not exists (
                      select 1 from public.schedules s2 
                      where s2.event_id = target_event_id and s2.group_member_id = gm.id
                  )
            )
            select member_id
            from candidate_pool
            order by 
                (case when level = 'beginner' then 1 else 0 end) asc, -- Iniciantes por último
                times_scaled_recent asc,                               -- Prioridade para quem foi menos escalado RECENTEMENTE
                acceptance_rate desc                                   -- Desempate pela confiabilidade
            limit v_required_count
        )
        loop
            -- 4. Inserir na escala
            insert into public.schedules (event_id, group_member_id, instrument, status)
            values (target_event_id, v_member_id, v_instrument_name, 'pending');
        end loop;
    end loop;
end;
$$;
