from django.conf.urls import patterns, url

from fairdata import views

urlpatterns = patterns('fairdata.views',
    url(r'^$', 'index'),
    url(r'^run_my_file/$', 'run_my_file'),
)
