use strict;
use warnings;
use JSON::XS;
use Data::Dumper;

my $input = '{"SESSION_ID": "iuherifubneb9", "requests": [{"transaction": "do something"},{"transaction": "do something else"}]}';
my $json = decode_json(''.$input);

print($json->{SESSION_ID});
print("\n");

if (!defined $json->{junk}) {
	print("there is no junk.\n");
}

foreach my $transaction (@{$json->{requests}}) {
	print($transaction->{transaction});
	print("\n");
}