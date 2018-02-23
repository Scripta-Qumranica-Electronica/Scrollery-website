package SQE_DBI_extended_queries;
use strict;
use warnings FATAL => 'all';

use Package::Constants;


use constant {

	GET_SIGN_DATA_FOR_COLUMN_OF_SCROLL_VERSION => << 'MYSQL',
SELECT
	col_data.name AS col_name,
	col_data.col_id AS col_id,
	line_data.name AS line_name,
	line_data.line_id AS line_id,
	parent.sign_id AS prev_sign_id,
	child.sign_id AS sign_id,
	child.next_sign_id AS next_sign_id,
	sign_char.is_variant,
	sign_char.break_type,
	sign_char.sign,
	sign_char_reading_data.is_reconstructed,
	sign_char_reading_data.readability,
	sign_char_reading_data.is_retraced
FROM position_in_stream_owner
	JOIN position_in_stream AS parent
		ON position_in_stream_owner.position_in_stream_id = parent.next_sign_id
	JOIN position_in_stream AS child
		ON parent.next_sign_id = child.sign_id
	JOIN line_to_sign ON line_to_sign.sign_id = child.sign_id
	Join line_to_sign_owner USING(line_to_sign_id)
	JOIN line_data USING(line_id)
	JOIN col_to_line USING(line_id)
	JOIN col_to_line_owner USING (col_to_line_id)
	JOIN col_data USING (col_id)
	JOIN sign_char
		ON sign_char.sign_id = child.sign_id
	JOIN sign_char_owner USING(sign_char_id)
	LEFT JOIN sign_char_reading_data USING(sign_char_id)
WHERE col_to_line.col_id = ?
      AND position_in_stream_owner.scroll_version_id = ?
      AND line_to_sign_owner.scroll_version_id = ?
      AND col_to_line_owner.scroll_version_id = ?
      AND sign_char_owner.scroll_version_id = ?
MYSQL

};

use Exporter 'import';
our @EXPORT_OK = Package::Constants->list(__PACKAGE__);

1;