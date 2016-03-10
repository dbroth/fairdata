from django.conf.urls import patterns, url

from fairdata import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^results', views.graph, name='graph'),
)
