
############################################################################################
#   SQE_DBI
############################################################################################

# A child of the normal Perl-DBI package which offers some functions for diret login
# and to create database-handler of the type SQE_db

package SQE_DBI;
use strict;
use DBI;
use warnings FATAL => 'all';
use Scalar::Util;
use SQE_Restricted;
use SQE_Error;
use SQE_database_queries;
use SQE_DBI_queries;
use parent 'DBI';

use Ref::Util;

# Returns a normal Perl DBI database handler for the SQE database
sub get_sqe_dbh {
    my $class = shift;
    my %attr  = (
        PrintError => 0,    # turn off error reporting via warn()
        RaiseError => 1,    # turn on error reporting via die()
	    mysql_enable_utf8 => 1,
    );
    my $dbh =
      DBI->connect( SQE_Restricted::DSN_SQE, SQE_Restricted::DB_USERNAME,
        SQE_Restricted::DB_PASSWORD,, \%attr );
    if ($dbh) {
        return $dbh;
    }
    else {
        return undef, SQE_Error::NO_DBH;
    }
}

# Creates a SQE_db databse handler for the SQE-database using the transmitted credential.
# Set's the user id as the default user id for all actions and, if given, also the version.
# The version can be set or altered later by using SQE_db->set_version_id
sub get_login_sqe {
    my ( $class, $user_name, $password, $version ) = @_;

    #Return with error data if either user name or password is missing
    return ( undef, SQE_Error::WRONG_USER_DATA )
      if not( $user_name && $password );

    # Try to get an database handler
    my ( $dbh, $error_ref ) = SQE_DBI->get_sqe_dbh();

    # Return with error data if no database handler is available
    return ( undef, $error_ref ) if not $dbh;

    #Transform into a SQE_db handler and try to login
    $dbh = bless $dbh, 'SQE_db';
    ( my $scrollversion, $error_ref ) =
      $dbh->set_user( $user_name, $password, $version );

    if ( !defined $scrollversion ) {

# The scrollversion does not exist or is not available for the user  - return the error and undef for the handler
        $dbh->disconnect;
        return ( undef, $error_ref );
    }
    else {
        # Otherwise return the handler
        return $dbh;
    }
}

############################################################################################
#   Databasehandler
############################################################################################

# A child of a normal DBI databasehandler which provides some functions
# to include user ids and versions, to log changes and to retrieve data.
{

    package SQE_db;
    use parent -norequire, 'DBI::db';

    use constant {
        GET_ALL_SIGNS_IN_FRAGMENT => << 'MYSQL',
		SELECT
            /* 0 */   position_in_stream.next_sign_id,
            /* 1 */   position_in_stream.sign_id,
            /* 2 */   sign_char.sign, /* 0 */
            /* 3 */   sign_char.sign_type_id,
            /* 4 */   sign_type.type,
            /* 5 */   sign_char.width,
            /* 6 */   sign_char.might_be_wider,
            /* 7 */   sign_char_reading_data.readability,
            /* 8 */   sign_char_reading_data.is_retraced,
            /* 9 */   sign_char_reading_data.is_reconstructed,
            /* 10 */  sign_char_reading_data.correction,
            /* 11 */  sign_char.is_variant,
            /* 12 */  sign_char_reading_data.sign_char_reading_data_id,
            /* 13 */  sign_char.sign_char_id,
            /* 14 */  if(sign_char_reading_data.sign_char_reading_data_id is null
                         or sign_char_reading_data_owner.scroll_version_id = _scrollversion_ , 0,
                         1) as var
        FROM col_to_line
						JOIN line_to_sign USING (line_id)
	JOIN position_in_stream USING (sign_id)
	JOIN position_in_stream_owner USING (position_in_stream_id)
	JOIN sign_char USING (sign_id)
   JOIN sign_char_owner USING (sign_char_id)
	JOIN sign_type USING(sign_type_id)
	LEFT JOIN sign_char_reading_data USING (sign_char_id)
	LEFT JOIN sign_char_reading_data_owner USING (sign_char_reading_data_id)
	WHERE col_id =?
	AND sign_char_owner.scroll_version_id = _scrollversion_
	AND position_in_stream_owner.scroll_version_id= _scrollversion_
        ORDER BY sign_char.sign_char_id, var

MYSQL

        GET_ALL_SIGNS_IN_LINE => << 'MYSQL',
        SELECT
            /* 0 */   position_in_stream.next_sign_id,
            /* 1 */   position_in_stream.sign_id,
            /* 2 */   sign_char.sign, /* 0 */
            /* 3 */   sign_char.sign_type_id,
            /* 4 */   sign_type.type,
            /* 5 */   sign_char.width,
            /* 6 */   sign_char.might_be_wider,
            /* 7 */   sign_char_reading_data.readability,
            /* 8 */   sign_char_reading_data.is_retraced,
            /* 9 */   sign_char_reading_data.is_reconstructed,
            /* 10 */  sign_char_reading_data.correction,
            /* 11 */  sign_char.is_variant,
            /* 12 */  sign_char_reading_data.sign_char_reading_data_id,
            /* 13 */  sign_char.sign_char_id,
            /* 14 */     if(sign_char_reading_data.sign_char_reading_data_id is null
                            or sign_char_reading_data_owner.scroll_version_id = _scrollversion_ , 0,
                            1) as var

        FROM line_to_sign
	JOIN position_in_stream USING (sign_id)
	JOIN position_in_stream_owner USING (position_in_stream_id)
	JOIN sign_char USING (sign_id)
    JOIN sign_char_owner USING (sign_char_id)
	JOIN sign_type USING(sign_type_id)
    LEFT JOIN sign_char_reading_data USING (sign_char_id)
    LEFT JOIN sign_char_reading_data_owner USING (sign_char_reading_data_id)
	WHERE line_id =?
	AND sign_char_owner.scroll_version_id = _scrollversion_
	AND position_in_stream_owner.scroll_version_id= _scrollversion_
        ORDER BY sign_char.sign_char_id, var

MYSQL

        NEW_MAIN_ACTION => << 'MYSQL',
INSERT INTO main_action
(scroll_version_id) VALUES (_scrollversion_)
MYSQL

        ADD_USER => << 'MYSQL',
        INSERT IGNORE INTO _table__owner
        (_table__id, scroll_version_id)
        SELECT
            _table__id,
            _scrollversion_
        FROM _table__owner
        JOIN _table_ USING (_table__id)
        _join_
        WHERE _where_
         AND _table__owner.scroll_version_id = _oldscrollversion_
MYSQL

        REMOVE_USER => << 'MYSQL',
        DELETE _table__owner
        FROM _table__owner
        JOIN _table_ USING (_table__id)
        _join_
        WHERE _where_
         AND _table__owner.scroll_version_id = _scrollversion_

MYSQL

        LOG_CHANGE_USER => << 'MYSQL',
        INSERT INTO single_action
        (main_action_id, action, `table`, id_in_table)
            SELECT _mainid_, '_actionart_', '_table_', _table__id
        FROM _table__owner
        JOIN _table_ USING (_table__id)
        _join_
        WHERE _where_
         AND _table__owner.scroll_version_id = _scrollversion_
MYSQL

        SIGN_CHAR_JOIN     => 'JOIN sign_char USING (sign_char_id)',
        LINE_TO_SIGN_JOIN  => 'JOIN line_to_sign USING (sign_id)',
        COL_TO_LINE_JOIN   => 'JOIN col_to_line USING (line_id)',
        SCROLL_TO_COL_JOIN => 'JOIN scroll_to_col USING (col_id)',
        ARTEFACT_POSITION_JOIN => 'JOIN artefact_position USING (artefact_id)',

        NEW_SCROLL_VERSION => << 'MYSQL',
        INSERT INTO scroll_version
        (user_id, scroll_id, version) values (?,?,?)
MYSQL

        NEXT_VERSION => << 'MYSQL',
        SELECT IFNULL(MAX(version)+1,0)
            FROM scroll_version
            WHERE user_id=? AND scroll_id=?
MYSQL

    };

# Internal function to add the current user/version to a table for a whole scroll or part of it
# The adding is not logged, thus to rewind it, one must use remove_user manually
#
# Parameters
#   Name of the data table
#   Array ref with joins to connect the table data with the scroll or part of it
#   Query fragment giving the data (of the part) of scroll
#   The scrollversion of the source
    sub _run_add_user_query {
        my ( $self, $table, $joins, $where, $old_scrollversion ) = @_;
        my $query = ADD_USER;
        $query =~ s/_table_/$table/go;
        $query =~ s/_join_/join(" ", @$joins)/oe;
        $query =~ s/_where_/$where/o;
        $query =~ s/_user_/$self->user_id/oe;
        $query =~ s/_scrollversion_/$self->scrollversion/oe;
        $query =~ s/_oldscrollversion_/$old_scrollversion/o;
        $self->do($query);
    }

# Internal function to remove the current user/version to a table for a whole scroll or part of it
# The removal is logged
#
# Parameters
#   Name of the data table
#   Array ref with joins to connect the table data with the scroll or part of it
#   Query fragment giving the data (of the part) of scroll
    sub _run_remove_user_query {
        my ( $self, $table, $joins, $where ) = @_;
        my $query = LOG_CHANGE_USER;
        $query =~ s/_table_/$table/go;
        $query =~ s/_join_/join(" ", @$joins)/oe;
        $query =~ s/_where_/$where/oe;
        $query =~ s/_user_/$self->user_id/oe;
        $query =~ s/_scrollversion_/$self->scrollversion/oe;
        $query =~ s/_mainid_/$self->action_log_id()/oe;
        $query =~ s/_actionart_/DELETE/o;
        $self->do($query);
        $query = REMOVE_USER;
        $query =~ s/_table_/$table/go;
        $query =~ s/_join_/join(" ", @$joins)/oe;
        $query =~ s/_where_/$where/oe;
        $query =~ s/_scrollversion_/$self->scrollversion/oe;
        $self->do($query);
    }

    # Internal function, thats adds an owner/version to a table and logs it
    # Note: this is done as part of a complex action logged as one group
    # thus is should only be called after start_logged_action is called before
    # in a calling function followed later by stop_logged_action
    #
    # Parameters
    #   table-name
    #   id of record to which the owner should be set
    sub _add_owner {
        my $self  = shift;
        my $table = shift;
        my $id    = shift;
        my $query =
"INSERT IGNORE INTO ${table}_owner (${table}_id, scroll_version_id) VALUES (?,_scrollversion_)";
        my $sth = $self->prepare_sqe($query);
        $sth->set_action( 'ADD', $table );
        $sth->logged_execute($id);
        $sth->finish;

    }

    # Creates a new scrollversion for the current user and the given scroll.
    # The new scrollversion can be retrieved by scrollverion
    #
    # Parameters
    #   scroll id
    sub create_new_scrollversion {
        my $self             = shift;
        my $scroll_id        = shift;
        my $next_version_sth = $self->prepare_cached(NEXT_VERSION);
        $next_version_sth->execute( $self->user_id, $scroll_id );
        my $version = $next_version_sth->fetchrow_arrayref->[0];
        $next_version_sth->finish;
        my $new_scrollversion_sth = $self->prepare_cached(NEW_SCROLL_VERSION);
        $new_scrollversion_sth->execute( $self->user_id, $scroll_id, $version );
        $self->_set_scrollversion( $self->{mysql_insertid} );
        $new_scrollversion_sth->finish;

    }

    # Internal function, thats removes an scrollversion from a table and logs it
    # Note: this is done as part of a complex action logged as one group
    # thus is should only be called after start_logged_action is called before
    # in a calling function followed later by stop_logged_action
    #
    # Parameters
    #   table-name
    #   id of record from which the owner should be removed
    sub _remove_owner {
        my $self  = shift;
        my $table = shift;
        my $id    = shift;
        my $query =
"DELETE FROM ${table}_owner WHERE ${table}_id = ?  AND scroll_version_id = _scrollversion_";
        my $sth = $self->prepare_sqe($query);
        $sth->set_action( 'DELETE', $table );
        my $result = $sth->logged_execute($id);
        $sth->finish;
        return $result;
    }

# Internal function which adds a record attributed by the current scrollversion to a table and logs it.
# The new record contains the same values as the one referred by $id except those given
# as an array of [field-name, value, fieldname, ...] which replace the old values.
# The function returns the id of the new record, or the old one if the new values are in fact
# identical with the old one.
#
# Note: if already a different record with the new values exist, the function returns its id and
# transform only the owner/version form the old to the new one
#
# Note: this is done as part of a complex action logged as one group
# thus is should only be called after start_logged_action is called before
# in a calling function followed later by stop_logged_action
#
# Parameters
#   the name of the table (note: there must exist a related owner table!)
#   the id of the source record
#   new values as array of field-name1, value1[, field-name2, value2, ...]
# if the value need to be calculated by a mysql-function the function and its parameters
#
# can be given as an arrray ref with the function name as first value followed by the parameters
# Thus: ['POINT', 0,0] would use the value calculated by POINT(0,0)
# Note: ad the moment no nested function are allowed
    sub _add_value {
        my ( $self, $table, $id, %values ) = @_;

       # Let's set the new id to the old id in case, there won't be a new record
        my $insert_id = $id;

        foreach my $key ( keys %values ) {

            # Search for values to be calculated first by a mysql-function
            # and replace the function by the calculated values
            if ( Ref::Util::is_arrayref( $values{$key} ) ) {
                my $command = shift @{ $values{$key} };
                if ( $command =~ /[^A-Za-z0-9_]/ ) {
                    return ( undef, SQE_Error::FORBIDDEN_FUNCTION );
                }
                my $question_marks =
                  join( ', ', map { '?' } @{ $values{$key} } );
                my $value_query = "SELECT $command($question_marks)";
                my $command_sth = $self->prepare_cached($value_query);
                if ( @{ $values{$key} } == 0 ) {
                    eval { $command_sth->execute };
                }
                else {
                    eval { $command_sth->execute( @{ $values{$key} } ) };
                }
                if ($@) {
                    $command_sth->finish;
                    return ( undef, SQE_Error::UNRECOGNIZED_FUNCTION ) if $@;
                }
                $values{$key} = $command_sth->fetchrow_arrayref->[0];
                $command_sth->finish;
            }
        }

        # get the old record
        my $query = SQE_DBI_queries::GET_ALL_VALUES;
        $query =~ s/_table_/$table/og;
        my $sth = $self->prepare_sqe($query);
        $sth->execute($id);

        # the record had been found
        if ( my $data_ref = $sth->fetchrow_hashref or $id == 0 ) {

            $data_ref = {} if !defined $data_ref;

            # replace the old values by the given new ones
            foreach my $key ( keys %values ) {
                $data_ref->{$key} = $values{$key};
            }

    # get all field-names except the id of the record and create a query to test
    # wether a different record containing the new vaules already exist
            my @keys =
              grep { defined $data_ref->{$_} && $_ ne '' }
              map { $_ if defined $data_ref->{$_} && $_ ne "${table}_id" } keys %$data_ref;
            my $fields = join( ' = ? AND ', @keys ) . ' = ?';
            $query = "SELECT ${table}_id from  $table where $fields";
            map {$query .= " AND $_ is null" if !defined $data_ref->{$_}} keys %$data_ref;
            my $new_sth = $self->prepare_cached($query);
            $new_sth->execute( map { $data_ref->{$_} } @keys );
            my @id = $new_sth->fetchrow_array;

            # if such a different record exist
            if ( @id > 0 && $insert_id != $id[0] ) {

                # Simply add current user/version as a new owner to it
                $insert_id = $id[0];
                $self->_add_owner( $table, $insert_id );
            }

            # if such a record does not exist
            elsif ( @id == 0 ) {

                # create a new record with the values
                my $question_marks = join( ', ', map { '?' } @keys );
                $query =
                    "INSERT INTO ${table} ("
                  . join( ', ', @keys )
                  . ") VALUES ($question_marks)";
                my $add_sth = $self->prepare_cached($query);
                $add_sth->execute( map { $data_ref->{$_} } @keys );
                $insert_id = $self->{mysql_insertid};
                $add_sth->finish;

                #Add the current user/version to the new record
                $self->_add_owner( $table, $insert_id );
            }
            $new_sth->finish;
        }
        else {
            $sth->finish;
            return ( undef, SQE_Error->RECORD_NOT_FOUND );
        }
        $sth->finish;

  #        if ( $table eq 'sign_char' ) {
  #            my $data_ids_sth = $self
  #              ->prepare_sqe(SQE_DBI_queries::GET_SIGN_CHAR_READING_DATA_IDS);
  #            $data_ids_sth->execute($id);
  #            foreach my $data_id ( $data_ids_sth->fetchrow_array ) {
  #                $self->change_value(
  #                    'sign_char_reading_data', $data_id,
  #                    'sign_char_id',           $insert_id
  #                );
  #            }
  #
  #        }
        return $insert_id;
    }

# Adds  a duplicate of record owned by current user/version with the given id with changed values and logs it.
# If the new values given are identical with the old ones, the record will be not duplicated
# and instead of the new id the old id is returned.
#
#
# Parameters
#   Table-name
#   id of the record to be duplicated
#   new values as array of field-name1, value1[, field-name2, value2, ...]
# if the value need to be calculated by a mysql-function the function and its parameters
#
# can be given as an arrray ref with the function name as first value followed by the parameters
# Thus: ['POINT', 0,0] would use the value calculated by POINT(0,0)
# Note: ad the moment no nested function are allowed
#@method
    sub add_value {
        my $self = shift;
        return ( undef, SQE_Error::QWB_RECORD ) if $self->scrollversion == 1;
        $self->start_logged_action;
        my ( $new_id, $error_ref ) = $self->_add_value(@_);
        $self->stop_logged_action;
        return ( $new_id, $error_ref );

    }

# Changes the record owned by the current user/version with the given id using the given values and logs it.
# If the new values given are identical with the old ones, nothing happens and the old id is returned
# Otherwise the id of the record with the changed value is returned
#
#
# Parameters
#   Table-name
#   id of the record to be changed
#   new values as array of field-name1, value1[, field-name2, value2, ...]
#
# if the value need to be calculated by a mysql-function the function and its parameters
#
# can be given as an arrray ref with the function name as first value followed by the parameters
# Thus: ['POINT', 0,0] would use the value calculated by POINT(0,0)
# Note: ad the moment no nested function are allowed

    sub change_value {
        my $self  = shift;
        my $table = shift;
        my $id    = shift;
        return ( undef, SQE_Error::QWB_RECORD ) if $self->scrollversion == 1;
        $self->start_logged_action;
        my ( $new_id, $error_ref ) = $self->_add_value( $table, $id, @_ );
        if ( defined $new_id ) {
            if ( $id != $new_id ) {
                $self->_remove_owner( $table, $id );
            }
            $self->stop_logged_action;
            return $new_id;
        }
        else {
            $self->stop_logged_action;
            return ( undef, $error_ref );

        }
    }

# Removes a record owned by the current user/version with the given id from user/version and logs it.
#
#
# Parameters
#   Table-name
#   id of the record to be duplicated
    sub remove_entry {
        my ( $self, $table, $id ) = @_;
        return ( undef, SQE_Error::QWB_RECORD ) if $self->scrollversion == 1;
        $self->start_logged_action;
        my $result = $self->_remove_owner( $table, $id );
        $self->stop_logged_action;
        if ( $result > 0 ) {
            return $result;
        }
        else {
            return ( undef, SQE_Error::RECORD_NOT_FOUND );
        }
    }

# Adds the given column/fragment from a user/version with all its data to the current user/version
# If the user_id of the source is not given, the default QWB text (user_id=0, version =0) is taken
#
# Note: the col/fragment is taken out from its original scroll!
#
# Parameters
#   Id of the column/fragment
#   id of the user_id of the old owner (optional)
#   version from the old user/version (optional)
    sub add_owner_to_col {
        my $self              = shift;
        my $id                = shift;
        my $where             = " col_to_line.col_id= $id";
        my $old_scrollversion = shift;

        if ( !defined $old_scrollversion ) {
            $old_scrollversion = 1;
        }

        $self->_run_add_user_query( 'sign_char_reading_data',
            [ SIGN_CHAR_JOIN, LINE_TO_SIGN_JOIN, COL_TO_LINE_JOIN ],
            $where, $old_scrollversion );

        $self->_run_add_user_query( 'sign_char',
            [ LINE_TO_SIGN_JOIN, COL_TO_LINE_JOIN ],
            $where, $old_scrollversion );

        $self->_run_add_user_query( 'sign_relative_position',
            [ LINE_TO_SIGN_JOIN, COL_TO_LINE_JOIN ],
            $where, $old_scrollversion );

        $self->_run_add_user_query( 'real_char_area',
            [ LINE_TO_SIGN_JOIN, COL_TO_LINE_JOIN ],
            $where, $old_scrollversion );

        $self->_run_add_user_query( 'position_in_stream',
            [ LINE_TO_SIGN_JOIN, COL_TO_LINE_JOIN ],
            $where, $old_scrollversion );

        $self->_run_add_user_query( 'line_to_sign', [COL_TO_LINE_JOIN],
            $where, $old_scrollversion );

        $self->_run_add_user_query( 'line_data', [COL_TO_LINE_JOIN],
            $where, $old_scrollversion );

        $self->_run_add_user_query( 'col_to_line', [], $where,
            $old_scrollversion );

        $self->_run_add_user_query( 'col_data', [], "col_data.col_id=$id",
            $old_scrollversion );

    }

# Adds the given scroll from a user/version with all its data to the current user/version
# If the user_id of the source is not given, the default QWB text (user_id=0, version =0) is taken
#
# Parameters
#   Id of the scroll
#   id of the userversion the old owner (optional)
    sub add_owner_to_scroll {
        my $self            = shift;
        my $scroll_id       = shift;
        my $where           = " scroll_to_col.scroll_id= $scroll_id";
        my $old_userversion = shift;

        if ( !defined $old_userversion ) {
            $old_userversion = 1;
        }

        $self->create_new_scrollversion($scroll_id);

        $self->_run_add_user_query(
            'sign_char_reading_data',
            [
                SIGN_CHAR_JOIN,   LINE_TO_SIGN_JOIN,
                COL_TO_LINE_JOIN, SCROLL_TO_COL_JOIN
            ],
            $where,
            $old_userversion
        );

        $self->_run_add_user_query( 'sign_char',
            [ LINE_TO_SIGN_JOIN, COL_TO_LINE_JOIN, SCROLL_TO_COL_JOIN ],
            $where, $old_userversion );

        $self->_run_add_user_query( 'sign_relative_position',
            [ LINE_TO_SIGN_JOIN, COL_TO_LINE_JOIN, SCROLL_TO_COL_JOIN ],
            $where, $old_userversion );

        $self->_run_add_user_query( 'real_char_area',
            [ LINE_TO_SIGN_JOIN, COL_TO_LINE_JOIN, SCROLL_TO_COL_JOIN ],
            $where, $old_userversion );

        $self->_run_add_user_query( 'position_in_stream',
            [ LINE_TO_SIGN_JOIN, COL_TO_LINE_JOIN, SCROLL_TO_COL_JOIN ],
            $where, $old_userversion );

        $self->_run_add_user_query( 'line_to_sign',
            [ COL_TO_LINE_JOIN, SCROLL_TO_COL_JOIN ],
            $where, $old_userversion );

        $self->_run_add_user_query( 'line_data',
            [ COL_TO_LINE_JOIN, SCROLL_TO_COL_JOIN ],
            $where, $old_userversion );

        $self->_run_add_user_query( 'col_to_line', [SCROLL_TO_COL_JOIN], $where,
            $old_userversion );

        $self->_run_add_user_query( 'col_data', [SCROLL_TO_COL_JOIN], $where,
            $old_userversion );

        $self->_run_add_user_query( 'scroll_to_col', [], $where,
            $old_userversion );

        $self->_run_add_user_query( 'scroll_data', [],
            "scroll_data.scroll_id=$scroll_id",
            $old_userversion );

        # Added by Bronson for copying artefact data
        $self->_run_add_user_query( 'artefact_position',
            [],
            "artefact_position.scroll_id=$scroll_id",
            $old_userversion );

        $self->_run_add_user_query( 'artefact',
            [ARTEFACT_POSITION_JOIN],
            "artefact_position.scroll_id=$scroll_id",
            $old_userversion );

        $self->_run_add_user_query( 'artefact_data',
            [ARTEFACT_POSITION_JOIN],
            "artefact_position.scroll_id=$scroll_id",
            $old_userversion );


    }

# Removes the given scroll from a user/version with all its data from the current user/version
#
# Parameters
#   Id of the scroll
    sub remove_owner_from_scroll {
        my $self  = shift;
        my $id    = shift;
        my $where = " scroll_to_col.scroll_id= $id";
        $self->start_logged_action;

        $self->_run_remove_user_query(
            'sign_char_reading_data',
            [
                SIGN_CHAR_JOIN,   LINE_TO_SIGN_JOIN,
                COL_TO_LINE_JOIN, SCROLL_TO_COL_JOIN
            ],
            $where
        );

        $self->_run_remove_user_query( 'sign_char',
            [ LINE_TO_SIGN_JOIN, COL_TO_LINE_JOIN, SCROLL_TO_COL_JOIN ],
            $where );

        $self->_run_remove_user_query( 'sign_relative_position',
            [ LINE_TO_SIGN_JOIN, COL_TO_LINE_JOIN, SCROLL_TO_COL_JOIN ],
            $where );

        $self->_run_remove_user_query( 'real_char_area',
            [ LINE_TO_SIGN_JOIN, COL_TO_LINE_JOIN, SCROLL_TO_COL_JOIN ],
            $where );

        $self->_run_remove_user_query( 'position_in_stream',
            [ LINE_TO_SIGN_JOIN, COL_TO_LINE_JOIN, SCROLL_TO_COL_JOIN ],
            $where );

        $self->_run_remove_user_query( 'line_to_sign',
            [ COL_TO_LINE_JOIN, SCROLL_TO_COL_JOIN ], $where );

        $self->_run_remove_user_query( 'line_data',
            [ COL_TO_LINE_JOIN, SCROLL_TO_COL_JOIN ], $where );

        $self->_run_remove_user_query( 'col_to_line', [SCROLL_TO_COL_JOIN],
            $where, );

        $self->_run_remove_user_query( 'col_data', [SCROLL_TO_COL_JOIN],
            $where );

        $self->_run_remove_user_query( 'scroll_to_col', [], $where );

        $self->_run_remove_user_query( 'scroll_data', [],
            "scroll_data.scroll_id=$id" );

        $self->stop_logged_action;

    }

# Removes the given column/fragment from a user/version with all its data from the current user/version
#
# Parameters
#   Id of the column/fragment
    sub remove_owner_from_col {
        my $self  = shift;
        my $id    = shift;
        my $where = " scroll_to_col.col_id= $id";
        $self->start_logged_action;

        $self->_run_remove_user_query(
            'sign_char_reading_data',
            [
                SIGN_CHAR_JOIN,   LINE_TO_SIGN_JOIN,
                COL_TO_LINE_JOIN, SCROLL_TO_COL_JOIN
            ],
            $where
        );

        $self->_run_remove_user_query( 'sign_char',
            [ LINE_TO_SIGN_JOIN, COL_TO_LINE_JOIN, SCROLL_TO_COL_JOIN ],
            $where );

        $self->_run_remove_user_query( 'sign_relative_position',
            [ LINE_TO_SIGN_JOIN, COL_TO_LINE_JOIN, SCROLL_TO_COL_JOIN ],
            $where );

        $self->_run_remove_user_query( 'real_char_area',
            [ LINE_TO_SIGN_JOIN, COL_TO_LINE_JOIN, SCROLL_TO_COL_JOIN ],
            $where );

        $self->_run_remove_user_query( 'position_in_stream',
            [ LINE_TO_SIGN_JOIN, COL_TO_LINE_JOIN, SCROLL_TO_COL_JOIN ],
            $where );

        $self->_run_remove_user_query( 'line_to_sign',
            [ COL_TO_LINE_JOIN, SCROLL_TO_COL_JOIN ], $where );

        $self->_run_remove_user_query( 'line_data',
            [ COL_TO_LINE_JOIN, SCROLL_TO_COL_JOIN ], $where );

        $self->_run_remove_user_query( 'col_to_line', [SCROLL_TO_COL_JOIN],
            $where, );

        $self->_run_remove_user_query( 'col_data', [SCROLL_TO_COL_JOIN],
            $where );

        $self->_run_remove_user_query( 'scroll_to_col', [], $where );

        $self->stop_logged_action;

    }

# Sets the user_id for a given user whose credential are provided
# Earlier set id's are overwritten.
# If version is provided, also the version number is set anew otherwise it is set to 0
# Parameters
#   username
#   password
#   version (optional)
# Returns the new scrollversion if ok, otherwise unddef and a ref to the appropriate error array
    sub set_user {
        my ( $self, $user_name, $password, $scrollversion ) = @_;
        undef $self->{private_SQE_DBI_data}->{main_action_sth};

        # Try to get the user id
        my $sth = $self->prepare(SQE_database_queries::GET_LOGIN);
        $sth->execute( $user_name, $password );
        if ( ( my $user_data = $sth->fetchrow_arrayref() )
            && not $sth->fetchrow_arrayref() )
        {
            #We got a unique user id - return datbase handler and id
            $sth->finish();
            $self->{private_SQE_DBI_data}->{user_id} = $user_data->[0];

            if ( $self->{private_SQE_DBI_data}->{user_id} == 0 ) {
                $self->_set_scrollversion(1);
                return 1;
            }
            elsif ( defined $scrollversion ) {
                return $self->set_scrollversion($scrollversion);
            }
            else {
                $self->_set_scrollversion(0);
                return 0;
            }

        }
        elsif ($user_data) {

    # We got more than one user ids - return without handler but with error data
            $sth->finish();
            $self->disconnect();
            return ( undef, SQE_Error::NO_UNIQUE_USER );

        }
        else {
            # We got no user id - - return without handler but with error data
            $sth->finish();
            $self->disconnect();
            return ( undef, SQE_Error::WRONG_USER_DATA );
        }

    }

# Sets the scrollversion to be used in sqe_queries
# The function checks, whether the new scrollversion does belong to the user.
# If ok, it returns the new scrollversion, otherwise undef and a ref to the  appropriate error-array
#
# Parameters:
#   new scrollversion
    sub set_scrollversion {
        my ( $self, $new_scrollversion ) = @_;

        # First check whether the new scrollversion is the global QWB version
        if ( $new_scrollversion == 1 ) {
            $self->_set_scrollversion(1);
            return 1;
        }

        # If not, check, whether the scrollversion belongs to the current user
        my $check_sth =
          $self->prepare_cached(SQE_DBI_queries::CHECK_SCROLLVERSION);
        $check_sth->execute($new_scrollversion);
        my $data_ref = $check_sth->fetchrow_arrayref;
        $check_sth->finish;
        if ( $data_ref && $data_ref->[0] == $self->user_id ) {
            $self->_set_scrollversion($new_scrollversion);
            return $new_scrollversion;
        }
        return ( undef, SQE_Error::WRONG_SCROLLVERSION );
    }

    # Internal function to sert a new scrollversion without prior checking
    # Parameters
    #   new scrollversion
    sub _set_scrollversion {
        my ($self, $new_scrollversion) = @_;
        $self->{private_SQE_DBI_data}->{scrollversion} = $new_scrollversion;
        my $set_to_db_sth = $self->prepare_cached(SQE_DBI_queries::SET_SESSION_SCROLLVERSION);
        $set_to_db_sth->execute($new_scrollversion, $self->session_id);
        undef $self->{private_SQE_DBI_data}->{main_action_sth};
    }

    #Returns the current SQE-session-id
    sub session_id {
        return shift->{private_SQE_DBI_data}->{session_id};
    }

    #Sets a new session_id
    #Paramater:
    #    session_id
    sub set_session_id {
        my ($self, $session_id)= @_;
        $self->{private_SQE_DBI_data}->{session_id}=$session_id;

    }

    # Returns the current user_id
    sub user_id {
        return shift->{private_SQE_DBI_data}->{user_id};
    }

    # Returns the current version
    sub scrollversion {
        return shift->{private_SQE_DBI_data}->{scrollversion};
    }

    # Returns the current action_log_id
    sub action_log_id {
        return shift->{private_SQE_DBI_data}->{main_action_id};
    }

    # Starts a set of logged actions
    # Must be ended by stop_logged_action
    # Logged action must use an SQE_st Statement and executed by logged_execute
    sub start_logged_action {
        my $self = shift;
        $self->{AutoCommit} = 0;
        my $sth = $self->{private_SQE_DBI_data}->{main_action_sth};
        if ( not $sth ) {
            my $query = NEW_MAIN_ACTION;
            $self->_inject_scroll_version_id( \$query );
            $sth = $self->prepare_cached($query);
            $self->{private_SQE_DBI_data}->{main_action_sth} = $sth;
        }
        $sth->execute();
        $self->{private_SQE_DBI_data}->{main_action_id} =
          $self->{mysql_insertid};
    }

    # Stops a set of logged actions startet with start_logged_action
    sub stop_logged_action {
        my $self = shift;
        $self->commit;
        $self->{AutoCommit} = 1;
    }

    # Prepares a SQE-statement handler with injected user- and version-id.
    # The statement is always cached.
    # Parameters
    #    same as DB->prepare parameters
    #@returns SQE_st
    sub prepare_sqe {
        my $self  = shift;
        my $query = shift;
        $self->_inject_scroll_version_id( \$query );
        return bless $self->prepare_cached( $query, @_ ), 'SQE_st';
    }

# Internal function to substitute _user_ and _version_ found in a query with the current user- and version-is
# Parameter:
# Reference to the query string
    sub _inject_scroll_version_id {
        my $self  = shift;
        my $query = shift;
        $$query =~ s/_scrollversion_/$self->scrollversion/goe;

    }

# Gives a reference to an hash.
# The keys are taken from the column number given after the query.
# Each key points to an ref to an array of refs to arrays which contain the rows
# found with the key values provided by the key column.
# Thus, the key column need not to provide unique keys.
#
# Parameters:
# query
# column number
# array of all values to be passed to the execute as to a normal execute
    sub selectall_hashref_with_key_from_column {
        my $self = shift;
        my $sth  = $self->prepare_sqe(shift);
        my $col  = shift;
        $sth->execute(@_);
        my $key;
        my $out_hash_ref = {};

        $sth->bind_col( $col, \$key );
        while ( my @array = $sth->fetchrow_array ) {
            if ( !defined $out_hash_ref->{$key} ) {
                $out_hash_ref->{$key} = [];
            }
            push @{ $out_hash_ref->{$key} }, \@array;
        }
        $sth->finish;
        return $out_hash_ref;
    }

    sub create_sign_stream_for_fragment_id {
        my ( $self, $id ) = @_;
        return SQE_sign_stream->new(
            $self->selectall_hashref_with_key_from_column
              ( GET_ALL_SIGNS_IN_FRAGMENT, 2, $id
              ),
        );
    }

    sub create_sign_stream_for_line_id {
        my ( $self, $id ) = @_;
        return SQE_sign_stream->new(
            $self
              ->selectall_hashref_with_key_from_column( GET_ALL_SIGNS_IN_LINE,
                2, $id
              ),
        );
    }

    # = DBI::db->selectcol_arrayref calles with a query string,
    # but uses injects automatically the current user-id and vesion
    sub selectcol_arrayref_sqe {
        my $self = shift;
        my $sth  = $self->prepare_sqe(shift);
        return $self->selectcol_arrayref( $sth, @_ );
    }

    # = DBI::db->selectall_arrayref calles with a query string,
    # but uses injects automatically the current user-id and vesion
    sub selectall_arrayref_sqe {
        my $self  = shift;
        my $query = shift;
        $self->_inject_scroll_version_id( \$query );
        return $self->selectall_arrayref( $query, @_ );
    }

}

############################################################################################
#   SQE_st
############################################################################################

# A child of DBI::st which adds function for logged actions
{

    package SQE_st;
    use parent -norequire, 'DBI::st';

    use constant {
        NEW_SINGLE_ACTION => << 'MYSQL',
        INSERT INTO single_action
        (main_action_id, action, `table`, id_in_table)
        VALUES (?, '_action_art_', '_table_', ?)
MYSQL

    };

# Tells the statementhandler which kind of action and table the following executes affect
# Parameters
#   the action ('ADD' or 'DELETE')
#   the affected table
    sub set_action {
        my ( $self, $action_art, $table ) = @_;
        if ( not $self->{private_sth} ) {
            my $query = NEW_SINGLE_ACTION;
            $query =~ s/_action_art_/$action_art/o;
            $query =~ s/_table_/$table/o;
            $self->{private_sth} = $self->{Database}->prepare_cached($query);
        }
    }

    # Execute the statement and logs it
    #
    sub logged_execute {
        my ( $self, $id ) = @_;
        my $dbh    = $self->{Database};
        my $result = $self->execute($id);
        $self->{private_sth}->execute( $dbh->action_log_id, $id )
          if $result > 0;
        return $result;

    }

    # Overwriting normal finish
    sub finish {
        my $self = shift;
        $self->{private_sth}->finish if $self->{private_sth};
        $self->SUPER::finish;
    }

}

############################################################################################
#   Signstreamhandler
############################################################################################

# Internal class which provides the logic for a sign stream created by SQE_DB->create_sign_stream_for_fragment_id
# or create_sign_stream_for_line_id
# A "sign" is in fact a ref to an hash containng all relevant data of the sign

{

    package SQE_sign_stream;

    sub new {
        my $class = shift;
        my $self  = bless {
            signs_ref       => shift,
            current_sign_id => shift,
            current_var_id  => 0,
        }, $class;
        return $self;
    }

    # Set the sign id as star id
    sub set_start_id {
        my $self = shift;
        $self->{current_sign_id} = shift;
    }

# Internal function which sets the the current sign id to the next value or to undef, if the end of the stream is reached.
# Returns the new id
    sub _next_sign_id {
        my $self = shift;
        return $self->{current_sign_id} =
          $self->{signs_ref}->{ $self->{current_sign_id} }->[0]->[0];
    }

    # Returns the next sign in the stream or undef if the end was reached.
    # Note - the next sign may also be a variant of the foregoing sign
    # thus the sequence is: sign1 - sign2 - sign2_var1 - sign2_var_2 -sign3 ...
    sub next_sign {
        my $self     = shift;
        my $old_sign_id = $self->{current_sign_id};
        my $next_sign;

# Try to load into $next_sign the next variant of the current_sign
# on succes, the variant index current_var_id is increased and points already
# to the next possible variant and $next_sign contains the reference to the next sign
# In this case we jump to elsif
        if ( $self->{current_sign_id} && not $next_sign =
            $self->{signs_ref}->{ $self->{current_sign_id} }
            ->[ ++$self->{current_var_id} ] )

 #this block is processed when no variant entrance for the current sign is found
        {
            #reset the variant index
            $self->{current_var_id} = 0;

            # return the next new sign if it exist
            if ( my $next_sign_id = $self->_next_sign_id) {
                $next_sign= $self->{signs_ref}->{$next_sign_id}->[0];
                if ($next_sign->[14]) {
                    pop @{$next_sign};
                    $next_sign->[12]=undef;
                }
            return $next_sign;
              }
         }
        # the next sign is a variant
        # test whether it is a real variant for this scrollversion
        # or found because there had been an entrance to sign_char_reading_data by a different scrollversion
        # which should only be taken if there was no previous record whith the same sign_char_id
        # in this case we proceed to the next sign by simply calling this function recursively
        elsif(defined $next_sign && $next_sign->[14]) {
                return $self->next_sign;
        }
        # At this point $next_sign either refers to the next variant or is undefined because the end
        # of the sign stream had been reached
        return $next_sign;
    }

}

1;

