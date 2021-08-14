export type PostgRestServiceSettings = {
  /**
   * name of database
   */
  db: string;

  /**
   * Name of schema. set to PGRST_DB_SCHEMA in docker
   */
  schema: string;

  /**
   * Anonymous role for postgresql. set to PGRST_DB_ANON_ROLE in docker
   */
  anonRole: string;
};
