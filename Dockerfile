FROM httpd:2.4
COPY ./httpd-cgi.conf /usr/local/apache2/conf/httpd.conf
COPY ./perl-dependencies.txt /tmp/perl-dependencies.txt
RUN apt-get update
RUN apt-get -y install make gcc libc-dev cpanminus libmysqlclient-dev
RUN xargs cpanm < /tmp/perl-dependencies.txt

EXPOSE 80