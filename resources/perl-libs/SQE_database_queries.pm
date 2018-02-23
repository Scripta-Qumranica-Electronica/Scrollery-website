package SQE_database_queries;
use strict;
use warnings FATAL => 'all';
use Package::Constants;

use constant {

    GET_LOGIN =>
      'SELECT user_id FROM user WHERE user_name = ? AND pw = SHA2(?, 224);'
};

use constant SIGN_OWNERS =>
  [ 'sign_relative_position', 'real_area_owner', 'position_in_stream' ];

use constant SIGN_CHAR_OWNERS              => ['sign_char'];
use constant SIGN_CHAR_READING_DATA_OWNERS => ['sign_char_reading_data'];
use constant LINE_OWNERS                   => [ 'line_data', 'line_to_sign' ];

use constant COL_OWNERS => [ 'col_data', 'col_to_line' ];

use constant SCROLL_OWNERS => [ 'scroll_data', 'scroll_to_col' ];

use constant {
    ADD_OWNER => <<'MYSQL',
        INSERT IGNORE INTO _table__owner
        (_table__id, user_id, version)
            VALUES (?,_user_,_version_)
MYSQL

    GET_COL_IDS => << 'MYSQL',
SELECT col_id
FROM scroll_to_col
    JOIN scroll_to_col_owner USING (scroll_to_col_id)
WHERE scroll_id = ?
      AND scroll_to_col_owner.user_id=_user_
      AND scroll_to_col_owner.version=_version_
MYSQL

    GET_LINE_IDS => << 'MYSQL',
SELECT line_id
FROM col_to_line
    JOIN col_to_line_owner USING (col_to_line_id)
WHERE col_id = ?
      AND col_to_line_owner.user_id=_user_
      AND col_to_line_owner.version=_version_
MYSQL

    GET_LINE_TO_SIGN_IDS => << 'MYSQL',
    select
    sign.sign_id
    FROM sign_owner
    JOIN sign_char USING (sign_char_id)
    JOIN sign USING (sign_id)
    JOIN line_to_sign USING (sign_id)
    JOIN col_to_line USING (line_id)
    JOIN scroll_to_col USING (col_id)
    WHERE _where_
    AND user_id=_user_
    AND version=_version_
MYSQL

    GET_SIGN_CHAR_OWNER_IDS => << 'MYSQL',
    select
    sign_char_owner.sign_char_id
    FROM sign_char_owner
    JOIN sign_char USING (sign_char_id)
    JOIN sign USING (sign_id)
    JOIN line_to_sign USING (sign_id)
    JOIN col_to_line USING (line_id)
    JOIN scroll_to_col USING (col_id)
    WHERE _where_
    AND user_id=_user_
    AND version=_version_
MYSQL

    GET_SIGN_CHAR_READING_DATA_OWNER_IDS => << 'MYSQL',
    SELECT
    sign_char_reading_data_owner.sign_char_reading_data_id
    FROM sign_char_reading_data_owner
    JOIN sign_char_reading_data USING (sign_char_reading_data_id)
    JOIN sign_char USING (sign_char_id)
    JOIN sign USING (sign_id)
    JOIN line_to_sign USING (sign_id)
    JOIN col_to_line USING (line_id)
    JOIN scroll_to_col USING (col_id)
    WHERE _where_
    AND user_id=_user_
    AND version=_version_
MYSQL





};

use Exporter 'import';
our @EXPORT_OK = Package::Constants->list(__PACKAGE__);

1;
