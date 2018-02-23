#!/usr/bin/perl
use strict;
use warnings FATAL => 'all';

use XML::Twig;
use SQE_GEO::svg_glyph_path;
use SQE_GEO::multipolygon;
use SQE_DBI;



binmode( STDOUT, ":encoding(UTF8)" );

my $twig = XML::Twig->new;
$twig->parsefile("/Users/ikottsi/fonts/LinBioLinumO.svg");

my $font_node = ( $twig->find_nodes('//font') )[0];
my $font_id   = $font_node->{att}->{id};
my $font_face=($twig->find_nodes('//font-face'))[0];
my $units_em = $font_face->{att}->{'units-per-em'};
if ( defined $font_id ) {
    my $dbh = SQE_DBI->get_sqe_dbh;
    if (
        $dbh->do(
            'INSERT IGNORE INTO external_font (font_id) values (?)', undef,
            $font_id
        ) == 1
      )
    {
        my $external_font_id = $dbh->{mysql_insertid};
        my $glyph_sth        = $dbh->prepare(
"INSERT INTO external_font_glyph (
external_font_id,
unicode_char,
path,
width,
height)
values (
?,
?,
MULTIPOLYGONFROMTEXT(?),
?,
?)"
        );
        foreach my $element ( $twig->find_nodes('//glyph') ) {
            my $unicode = $element->{att}->{unicode};
            my $path    = $element->{att}->{d};
            if ( defined $unicode && defined $path && length($unicode) == 1 ) {
                my $svg_path = SQE_GEO::svg_glyph_path->new($path, $units_em);
                my $mp       = $svg_path->GIS_multipolygon;
                $mp->move_to_origin;
                print "$unicode\n";
                print $mp->height . "\n";
#                print $mp->as_MULTIPOLYGON_string . "\n";
                $glyph_sth->execute(
                    $external_font_id,
                    $unicode,
                    $mp->as_MULTIPOLYGON_string,
                    $mp->width,
                    $mp->height
                        );
            }
        }
    }
    else {
        print "Font already known!";
    }
}
else {
    print "Wrong font";
}
