FROM httpd:2.4
COPY ./httpd-cgi.conf /usr/local/apache2/conf/httpd.conf
COPY ./bin/load-perl-deps.sh /tmp/load-perl-deps.sh
RUN chmod +x /tmp/load-perl-deps.sh
RUN apt-get update
RUN apt-get -y install make gcc libc-dev cpanminus libmysqlclient-dev

EXPOSE 80