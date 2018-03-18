#!/usr/bin/perl

# TODO: Add support for handling the SQE_DB_API and Data-files packages

# !!!REMINDER!!!: I have removed the secret key, you must
# put this in line 29 for the script to function.

use strict;
use warnings;
use CGI;
use Digest::SHA qw(hmac_sha1_hex);
use Data::Dumper;
use JSON qw( decode_json );
use File::chdir;

# The main routine is cordoned off into
# a subroutine to protect the scope.
sub parseWebhook {
	# Read the authentication header.
	my $q = CGI->new;
	my $x_hub_signature = $q->http('X-Hub-Signature') || '<no-x-hub-signature>';
	my $body = ''.$q->param('POSTDATA');
	print $q->header('text/plain');

	# If the request authenticates, then begin reading
	# the transmitted data.
	# REMINDER: I have removed the secret key, you must
	# put this in for the script to function.
	if ("sha1=" . hmac_sha1_hex($body, 'YOUR_SECRET_KEY') eq $x_hub_signature) {

		# Open the log file.
		# Parse the transmitted JSON data.
		my $hookInfo = '/var/www/html/stable/webhook/report.txt';
		open(my $fh, '>', $hookInfo) or die "Could not open file '$hookInfo' $!";
		my $event = $q->http('X-Github-Event');
		my $json = decode_json($body);

		# Parse the headers and dump them into the log file.
		my %headers = map { $_ => $q->http($_) } $q->http();
		print $fh "Got the following headers:\n";
		for my $header ( keys %headers ) {
			print $fh "$header: $headers{$header}\n";
		}
		print $fh "Got the following payload:\n";
		print $fh Dumper($json);
		print $fh "\n";
		print $fh "The event was a: $event. \n";

		# Check for ping and simply spit out all the transmitted data
		if ($event eq 'ping') {
			print $fh "Nothing to worry about, I just got pinged. \n";
		}

		# Check for a push event.
		elsif ($event eq 'push') {
			print $fh "Change made to $json->{ref} \n";
			my ($base, $type, $branch) = split /\//, $json->{ref};
			print $fh "Change made to base: $base, type: $type, branch: $branch. \n";
			if ($type eq "heads") {
				system("/var/www/html/stable/webhook/add_scrollery.pl $branch branch &");
			}
		}

		# Respond to a new create event by pulling down
		# and compiling the new tag.
		elsif ($event eq 'create') {
			print $fh "Change of type $json->{ref_type} \n";
			print $fh "Change made to $json->{ref} \n";
			if ($json->{ref_type} eq "tag") {
				system("/var/www/html/stable/webhook/add_scrollery.pl $json->{ref} tag &");
			}
		}

		# Close the log file.
		print $fh "\n";
		close $fh;
	}
}
parseWebhook();