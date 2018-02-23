package SQE_CGI;
use strict;
use warnings FATAL => 'all';
use Data::UUID;
use SQE_DBI;
use SQE_CGI_queries;

use parent 'CGI';

our $sqe_sessions;


#@returns SQE_db
sub new {
    my ( $class, %args ) = @_;
    # $sqe->sessions should be initialised only once
    $sqe_sessions = {} if !defined $sqe_sessions;
    my SQE_db $dbh;

    my $self = $class->SUPER::new(%args);
    bless $self, 'SQE_CGI';

    #$self->start_json_output;

    # We don't want get-parameter
        if ($self->url_param) {
         #   $self->sent_json_error(SQE_Error::NO_GET_REQUESTS);
            return ($self, SQE_Error::NO_GET_REQUESTS);

        }



    $self->{SQE_SESSION_ID} = $self->param('SESSION_ID');

    # Sessionid is provided
    if ( $self->{SQE_SESSION_ID} ) {
        $dbh = $sqe_sessions->{$self->{SQE_SESSION_ID}};


        # But no Databasehandle
        if ( !defined $dbh ) {

            # Get a new Databasehandler
            ( $dbh, my $error_ref ) = SQE_DBI->get_sqe_dbh();

            # A Databasehandler could not be created
            if ( !defined $dbh ) {
              #  $self->sent_json_error($error_ref);
                return ( $self, $error_ref );
            }

            # Otherwise, get the data for the Sessionid
            $dbh = bless $dbh, 'SQE_db';
            $sqe_sessions->{SQE_SESSION_ID} = $dbh;
            my $session_id_sth =
              $dbh->prepare(SQE_CGI_queries::GET_SQE_SESSION);
            $session_id_sth->execute( $self->{SQE_SESSION_ID} );
          #  $self->print($self->{SQE_SESSION_ID});
            # Data are available
            my $result_ref = $session_id_sth->fetchrow_arrayref;

            if (defined $result_ref->[0] ) {
                $dbh->{private_SQE_DBI_data}->{user_id} = $result_ref->[0];
                $dbh->{private_SQE_DBI_data}->{scrollversion} =
                  $result_ref->[1];
                $sqe_sessions->{$self->{SQE_SESSION_ID}}=$dbh;
                $dbh->set_session_id($self->{SQE_SESSION_ID});
            }

            # No entry found
            else {
                $dbh->disconnect;
             #   $self->sent_json_error(SQE_Error::WRONG_SESSION_ID);
                return ( $self, SQE_Error::WRONG_SESSION_ID );
            }
        }
    }

    # No sessionid given
    # Try to create a new session
    else {

        # Try to get a databasehandler via credentials
        my $user_name = $self->param('USER_NAME');
        my $password = $self->param('PASSWORD');
        my $scrollversion = $self->param('SCROLLVERSION');
        ( $dbh, my $error_ref ) = SQE_DBI->get_login_sqe(
            $user_name, $password, $scrollversion
        );

        # If no handler could be created
        if ( !defined $dbh ) {
         #   $self->sent_json_error($error_ref);
         #   $self->finish_json_output;
            return ( $self, $error_ref );
        }

        # We got a handler - let's start a new session
        else {
            my $ug         = Data::UUID->new;
            my $session_id = $ug->to_string( $ug->create );
            $sqe_sessions->{$session_id} = $dbh;
            my $session_sth = $dbh->prepare(SQE_CGI_queries::NEW_SQE_SESSION);
            $session_sth->execute( $session_id, $dbh->user_id,
                $dbh->scrollversion );

            #            $self->{DBH} = $dbh;

            # ToDo: Put the Session_id finally to the DB-handler and not in in the CGI object
            $self->{SQE_SESSION_ID} = $session_id;
            $dbh->set_session_id($session_id);

        }
    }
    $self->{DBH} = $dbh;
   # $self->print( '"SESSION_ID":"' . $self->{SQE_SESSION_ID} . '",' );
    return ($self);
}

sub DESTROY {
    my $self = shift;
    if ( $self->{DBH} ) {
        $self->{DBH}->do( SQE_CGI_queries::SET_SESSION_END,
            undef, $self->{DBH}->scrollversion, $self->session_id );
    }
}


# Retrieves the current databse handler
#@returns SQE_db
sub dbh {
    return shift->{DBH};
}

#  the current session id
sub session_id {
    return shift->{DBH}->session_id;
}


# Prints a JSON-formated error to the CGI-output
# Use print_json_error
#@deprecated
sub sent_json_error {
    shift->print_json_error;
}

# Prints a JSON-formated error to the CGI-output
# Parameters:
#     error_ref: reference to an error array
sub print_json_error{
    my ( $self, $error_ref ) = @_;
    $self->print( '"TYPE":"ERROR","ERROR_CODE":'
          . $error_ref->[0]
          . ',"ERROR_TEXT":"'
          . $error_ref->[1]
          . '"' );
}


# Print a JSON header to the CGI-output and opnes a JSON-object
# Should be used instead of the header fundtion of the normal CGI
sub start_json_output {
    my $self = shift;
    $self->header('application/json;charset=UTF-8');
    $self->print('{');
}


# Prints the  Session Id in JSON format to the CGI output
sub print_session_id {
    my $self = shift;
    $self->print('"SESSION_ID":"'. $self->session_id . '",');

}



sub finish_json_output {
    shift->print('}');
}

1;
