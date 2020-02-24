
exports.up = async (knex) => {
  await knex.raw(`
    CREATE OR REPLACE FUNCTION sync_submission_to_connect()
      RETURNS trigger AS
    $BODY$
      BEGIN
      
        IF TG_OP = 'INSERT' THEN
          INSERT INTO salesforce.selfie__c (upload_id__c, url__c, createddate)
            VALUES (NEW.upload_id, NEW.character_url, NEW.created_at);
          RETURN NEW;

        ELSIF TG_OP = 'UPDATE' THEN
          UPDATE salesforce.selfie__c SET
            url__c = NEW.character_url
          WHERE
            salesforce.selfie__c.upload_id__c = NEW.upload_id;
          IF NOT FOUND THEN RETURN NULL; END IF;
          RETURN NEW;

        ELSIF TG_OP = 'DELETE' THEN
          DELETE FROM salesforce.selfie__c
            WHERE salesforce.selfie__c.upload_id__c = OLD.upload_id;
          IF NOT FOUND THEN RETURN NULL; END IF;
          RETURN OLD;

        END IF;
      END;
    $BODY$
      LANGUAGE plpgsql;
   `)

  await knex.raw(`
    CREATE TRIGGER sync_submission_to_connect
    AFTER UPDATE OR INSERT OR DELETE ON submissions
    FOR EACH ROW
    EXECUTE PROCEDURE sync_submission_to_connect();
  `)
};

exports.down = async (knex) => {
  await knex.raw('DROP TRIGGER IF EXISTS sync_submission_to_connect ON submissions;')
  await knex.raw('DROP FUNCTION IF EXISTS sync_submission_to_connect();')
};
