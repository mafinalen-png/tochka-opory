-- Только проверка. Ничего не изменяет.
select to_regclass('public.tochka_workspaces') as table_exists;
select proname from pg_proc where proname in (
  'psych_create_client',
  'psych_rotate_client_link',
  'client_get_workspace',
  'client_save_workspace'
) order by proname;
