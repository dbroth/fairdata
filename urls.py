from django.conf.urls import patterns, url

from fairdata import views

urlpatterns = patterns('fairdata.views',
    url(r'^$', 'index'),
    url(r'^accept_file/$', 'accept_file'),
    url(r'^run_script/$', 'run_script'),
)
