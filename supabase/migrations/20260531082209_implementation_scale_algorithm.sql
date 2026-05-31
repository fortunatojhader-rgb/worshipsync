-- Função para calcular a taxa de aceitação de um membro
create or replace function public.get_member_acceptance_rate(member_id uuid)
returns float language sql security definer as $$
  select 
    case 
      when count(*) = 0 then 1.0 -- Se nunca foi escalado, taxa máxima para incentivar
      else (count(*) filter (where status = 'confirmed'))::float / count(*)
    end
  from public.schedules
  where group_member_id = member_id;
$$;

-- Função principal do Algoritmo de Escala com Equidade
create or replace function public.generate_event_scale(target_event_id uuid)
returns void language plpgsql security definer as $$
declare
    v_group_id uuid;
    v_event_date date;
    v_formation jsonb;
    v_instrument_name text;
    v_required_count int;
    v_count int;
    v_member_id uuid;
begin
    -- 1. Obter informações do evento e a formação padrão do grupo
    select group_id, event_date::date into v_group_id, v_event_date
    from public.events where id = target_event_id;

    select default_formation into v_formation
    from public.groups where id = v_group_id;

    -- Limpa escala existente para este evento se o líder rodar novamente
    delete from public.schedules where event_id = target_event_id;

    -- 2. Iterar sobre cada instrumento na formação padrão
    for v_instrument_name, v_required_count in select * from jsonb_each_text(v_formation)
    loop
        v_count := 0;
        
        -- 3. Buscar os melhores candidatos para este instrumento
        -- Critérios: 
        --   - Não ser iniciante (priorizar interm/adv)
        --   - Menor número de vezes escalado para este instrumento (equidade)
        --   - Melhor taxa de aceitação (desempate)
        --   - Não ter impedimento na data
        --   - Não estar escalado para outra função no mesmo evento
        for v_member_id in (
            with candidate_pool as (
                select 
                    gm.id as member_id,
                    mi.level,
                    -- Contagem de vezes que foi escalado para este instrumento específico
                    (select count(*) from public.schedules s where s.group_member_id = gm.id and s.instrument = v_instrument_name) as times_scaled,
                    public.get_member_acceptance_rate(gm.id) as acceptance_rate
                from public.group_members gm
                join public.member_instruments mi on mi.group_member_id = gm.id
                where gm.group_id = v_group_id
                  and mi.instrument = v_instrument_name
                  -- Filtro de Disponibilidade (Data única e Período)
                  and not exists (
                      select 1 from public.availability_blocks ab 
                      where ab.group_member_id = gm.id 
                        and (
                            (ab.type = 'once' and ab.date = v_event_date) or
                            (ab.type = 'period' and v_event_date between ab.start_date and ab.end_date)
                            -- Nota: RRULE simplificado para este MVP
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
                times_scaled asc,                                     -- Prioridade para quem foi menos escalado
                acceptance_rate desc                                  -- Melhor taxa de aceitação desempata
            limit v_required_count
        )
        loop
            -- 4. Inserir na escala
            insert into public.schedules (event_id, group_member_id, instrument, status)
            values (target_event_id, v_member_id, v_instrument_name, 'pending');
            
            v_count := v_count + 1;
        end loop;
    end loop;
end;
$$;
