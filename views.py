from django.core.context_processors import csrf
from django.shortcuts import render, render_to_response
from django.template import Context, loader, RequestContext
from django.http import HttpResponseRedirect, HttpResponse
from django.http import Http404
from django.views.generic import View, FormView, TemplateView
from django.conf import settings
from django.core.files import File
from django.core.servers.basehttp import FileWrapper

from fairdata.models import Uploaded_File

def index(request):
    t = loader.get_template("fairdata/index.html")
    c = RequestContext(request,{})
    return HttpResponse(t.render(c))
