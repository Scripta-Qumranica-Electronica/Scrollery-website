package SQE_API::Worker;
use strict;
use lib qw(../);

use warnings FATAL => 'all';

use SQE_Error;
use SQE_database;
use SQE_API::Queries;
use SQE_API::format_json;
use SQE_API::format_qwb_html;
use SQE_DBI;

use Exporter 'import';

our @EXPORT_OK = qw (process get_error_string);

sub process {
    my $data = { cgi => shift };

    $data->{dbh} = $data->{cgi}->dbh;

    # Ok, no let's run the actions

    my $action = $data->{cgi}->param('GET');

    # Run default action = 'TEXT'
    if ( ( not $action ) || $action eq 'TEXT' ) {
        return get_text($data);
    }

    if ( $action eq 'SCROLLNAMES' ) {
        return get_scroll_names($data);
    }

    if ( $action eq 'FRAGMENTNAMES' ) {
        return get_fragment_names($data);
    }

    if ( $action eq 'LINENAMES' ) {
        return get_line_names($data);
    }

    return get_error_string(SQE_Error::NO_ACTION);

}

sub get_scroll_names {
    my $data        = shift;
    my $scroll_name = $data->{cgi}->param('SCROLL');
    if ($scroll_name) {
        $scroll_name =~ s/\*/%/go;
        $scroll_name =~ s/\?/_/go;
    }
    else {
        $scroll_name = '%';
    }
    my $scroll_data_ref =
      $data->{dbh}->selectcol_arrayref_sqe( SQE_API::Queries::GET_SCROLLS, { Columns => [2] },
        $scroll_name);
    my $out = '"TYPE":"LIST","SCROLLNAMES":[';
    if (@$scroll_data_ref) {
        return $out . '"' . ( join '","', @$scroll_data_ref ) . '"]';
    }
    else {
        return $out . ']';

    }
}

sub get_fragment_names {
    my $data = shift;
    my ( $scroll_id, $scroll_name ) = get_unique_scroll($data);
    if ( not $scroll_id ) {
        return $scroll_name;
    }
    my $fragment_name = $data->{cgi}->param('FRAGMENT');
    if ($fragment_name) {
        $fragment_name = '^' . quote($fragment_name);
        $fragment_name =~ s/\\([*?])/.$1/go;
    }
    else {
        $fragment_name = '.*';
    }
    my $fragment_data_ref =
      $data->{dbh}->selectcol_arrayref_sqe( SQE_API::Queries::GET_FRAGMENTS,
        { Columns => [2] },
        $scroll_id, $fragment_name
      );
    my $out = '"TYPE":"LIST","FRAGMENTNAMES":[';

    if (@$fragment_data_ref) {
        return $out . '"' . ( join '","', @$fragment_data_ref ) . '"]';
    }
    else {
        return $out . ']';

    }

}

sub get_line_names {
    my $data = shift;
    my ( $scroll_id, $scroll_name ) = get_unique_scroll($data);
    if ( not $scroll_id ) {
        return $scroll_name;
    }
    my $fragment_name =
      '^' . quote( $data->{cgi}->param('FRAGMENT') ) . '( [iv]+)?$';
    my $fragment_ids =
      $data->{dbh}->selectall_arrayref_sqe( SQE_API::Queries::GET_FRAGMENTS,
          undef,
         $scroll_id, $fragment_name);
    if ( @$fragment_ids == 0 ) {
        return get_error_string(SQE_Error::FRAGMENT_NOT_FOUND);
    }
    elsif ( @$fragment_ids > 1 ) {
        return get_error_string(SQE_Error::NO_UNIQUE_FRAGMENT);
    }

    my $line_name = $data->{cgi}->param('LINE');
    if ($line_name) {
        $line_name =~ s/\*/%/go;
        $line_name =~ s/\?/_/go;
    }
    else {
        $line_name = '%';
    }

    my $line_data_ref =
      $data->{dbh}->selectcol_arrayref_sqe( SQE_API::Queries::GET_LINES,
        { Columns => [1] },
        $fragment_ids->[0]->[0],
        $line_name
      );

    my $out = '"TYPE":"LIST","LINENAMES":[';

    if (@$line_data_ref) {
        return $out . '"' . ( join '","', @$line_data_ref ) . '"]';
    }
    else {
        return $out . ']';

    }

}

sub get_unique_scroll {
    my $data        = shift;
    my $scroll_name = $data->{cgi}->param('SCROLL');
    $scroll_name = quote($scroll_name);
    my $scroll_id;
    my $scroll_name_sth = $data->{dbh}->prepare_sqe(SQE_API::Queries::GET_SCROLLS);
    $scroll_name_sth->execute( $scroll_name);
    ( $scroll_id, $scroll_name ) = $scroll_name_sth->fetchrow_array;
    if ( not $scroll_id ) {
        $scroll_name_sth->finish;
        return undef, get_error_string(SQE_Error::SCROLL_NOT_FOUND);
    }
    elsif ( $scroll_name_sth->fetchrow_arrayref ) {
        $scroll_name_sth->finish;
        return get_error_string(SQE_Error::NO_UNIQUE_SCROLL);
    }
    $scroll_name_sth->finish;
    return $scroll_id, $scroll_name;

}

sub get_text {
    my $data = shift;
    my ( $scroll_id, $scroll_name ) = get_unique_scroll($data);
    return $scroll_name if ( not $scroll_id );

    # Get the optional line name - we need it now to evaluate the fragment
    $data->{line_name} = $data->{cgi}->param('LINE');

    #Try to get fragments and their ids

    my $fragment_name = $data->{cgi}->param('FRAGMENT');
    $fragment_name =  '^' . quote( $fragment_name ) . '( [iv]+)?$';
    my $fragment_ids =
      $data->{dbh}->selectall_arrayref_sqe( SQE_API::Queries::GET_FRAGMENTS,
        undef, $scroll_id, $fragment_name);
    if ( @$fragment_ids == 0 ) {
        return get_error_string(SQE_Error::FRAGMENT_NOT_FOUND);
    }
    elsif ( $data->{line_name} && @$fragment_ids > 1 ) {
        return get_error_string(SQE_Error::NO_UNIQUE_FRAGMENT);
    }

    # Reaching this point, we need now the format to use

    my $format = $data->{cgi}->param('FORMAT');
    $format = 'JSON' if not $format;

    my $out_text;
   if ( $format eq 'JSON' ) {
        $data->{format_template} = SQE_API::format_json->new( \$out_text );
    }
    elsif ( $format eq 'QWB_HTML' ) {
        $data->{format_template} =
          SQE_API::format_qwb_html->new( \$out_text);
    }
    else {
        return get_error_string(SQE_Error::WRONG_FORMAT);
    }

    # No lets start to build up the result

    $out_text = '"TYPE":"TEXT","FORMAT":"' . $format . '",';
    $data->{format_template}->format_scroll($scroll_name);

    ##### Finally, process the fragment(s) or line

    if ( $data->{line_name} ) {
        my $get_line_break_sth =
          $data->{dbh}->prepare_sqe(SQE_API::Queries::GET_LINE_BREAK);
        $get_line_break_sth->execute( $fragment_ids->[0]->[0],
            $data->{line_name}, 'LINE_START');
        my $line_id;
        ( $data->{fragment_start}, $line_id ) =
          $get_line_break_sth->fetchrow_array;
        if ( not $line_id ) {
            $get_line_break_sth->finish;
            return get_error_string(SQE_Error::LINE_NOT_FOUND);
        }
        $get_line_break_sth->finish;
        $data->{get_line_data_sth} =
          $data->{dbh}->prepare_sqe(SQE_API::Queries::GET_LINE_DATA);
        $data->{sign_stream} = $data->{dbh}->create_sign_stream_for_line_id($line_id);
        $data->{sign_positions_ref} =
          $data->{dbh}->selectall_hashref_with_key_from_column(
            SQE_API::Queries::GET_ALL_SIGN_POSITIONS_IN_LINE,
            2, $line_id);
        get_fragment( $fragment_ids->[0], $data );
        $data->{get_line_data_sth}->finish;
    }
    else {
        my $get_fragment_break_sth =
          $data->{dbh}->prepare_sqe(SQE_API::Queries::GET_FRAGMENT_BREAK);
        $data->{get_line_data_sth} =
          $data->{dbh}->prepare_sqe(SQE_API::Queries::GET_LINE_DATA);
        foreach my $single_data (@$fragment_ids) {
            $get_fragment_break_sth->execute( $single_data->[0],
                'COLUMN_START' );
            if (
                not $data->{fragment_start} =
                ( $get_fragment_break_sth->fetchrow_array )[0]

              )
            {
                $get_fragment_break_sth->finish;

                return get_error_string(SQE_Error::FRAGMENT_NOT_FOUND);
            }
            $data->{sign_stream} = $data->{dbh}->create_sign_stream_for_fragment_id($single_data->[0]);
            $data->{sign_positions_ref} =
                $data->{dbh}->selectall_hashref_with_key_from_column(
                    SQE_API::Queries::GET_ALL_SIGN_POSITIONS_IN_FRAGMENT,
                    2,
                    $single_data->[0]
                );
            get_fragment( $single_data, $data );

        }
        $data->{get_line_data_sth}->finish;
        $get_fragment_break_sth->finish;


    }

    $data->{format_template}->format_end();
    return $out_text;
}

sub get_error_string {
    my $error = shift;
    return
        '"TYPE":"ERROR","ERROR_CODE":'
      . $error->[0]
      . ',"ERROR_TEXT":"'
      . $error->[1];

}

sub get_fragment {
    my ( $fragment_data, $data ) = @_;
    $data->{format_template}->format_fragment( $fragment_data->[1] );
    my $sign_data_array_ref;
    my $next_sign_id = $data->{fragment_start};
    my $sign_type;
    my $is_start=1;
    $data->{sign_stream}->set_start_id($next_sign_id);

    SIGNS: while ($sign_data_array_ref = $data->{sign_stream}->next_sign) {
        while ($sign_data_array_ref->[3]== 9) {
            $sign_data_array_ref = $data->{sign_stream}->next_sign;
            if (defined $sign_data_array_ref && defined $sign_data_array_ref->[3]) {
                $is_start = 1;
            } else {
                last SIGNS;
            }
        }
        if ($is_start==1) {
            $data->{get_line_data_sth}->execute( $sign_data_array_ref->[1]);
            ( $next_sign_id, $data->{line_name} ) =
                $data->{get_line_data_sth}->fetchrow_array;
            $data->{format_template}->format_line( $data->{line_name} );
            $is_start=0;
        }
        $data->{format_template}->format_sign( $sign_data_array_ref,
            $data->{sign_positions_ref} )
    }
    $data->{format_template}->format_column_end;

}

sub quote {
    my $string = shift;
    $string =~ s/([.*?_%])/\\$1/go;
    return $string;
}

1;
