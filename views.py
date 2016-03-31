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
import datetime
import subprocess

def index(request):
    t = loader.get_template("fairdata/index.html")
    c = RequestContext(request,{})
    return HttpResponse(t.render(c))

def run_script(request):
    in_path = str(request.GET.get('in_path')) + ' '
    protected = str(request.GET.get('protect')) + ' '
    pro_pos = str(request.GET.get('protected_pos', '')) + ' ' 
    selected = str(request.GET.get('selected', '')) + ' '
    sel_pos = str(request.GET.get('selected_pos', '1')) + ' ' 
    out_path = str(request.GET.get('out_path')) 
    command = "python /static/fairdata/main.py " + in_path + protected + pro_pos + selected + sel_pos + out_path
    subprocess.call(command, shell=True)
    return HttpResponse("YOU GO GLEN COCO")
