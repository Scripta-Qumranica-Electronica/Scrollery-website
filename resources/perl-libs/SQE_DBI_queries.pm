package SQE_DBI_queries;
use strict;
use warnings FATAL => 'all';
use Package::Constants;

use constant {
    CHECK_SCROLLVERSION => << 'MYSQL',
SELECT user_id
FROM scroll_version
WHERE scroll_version_id = ?
MYSQL

    SET_SESSION_SCROLLVERSION => << 'MYSQL',
UPDATE sqe_session
SET scroll_version_id = ?
WHERE sqe_session_id = ?
MYSQL


    GET_ALL_VALUES => << 'MYSQL',
    SELECT _table_.*
    FROM _table_
     JOIN _table__owner USING (_table__id)
    WHERE _table__id = ?
    AND scroll_version_id = _scrollversion_
MYSQL

    GET_SIGN_CHAR_READING_DATA_IDS => << 'MYSQL',
  SELECT sign_char_reading_data_id
      FROM sign_char_reading_data
      JOIN sign_char_reading_data_owner USING (sign_char_reading_data_id)
      WHERE sign_char_id=?
          AND scroll_version_id= _scrollversion_
    
MYSQL

};

use Exporter 'import';
our @EXPORT_OK = Package::Constants->list(__PACKAGE__);

1;
