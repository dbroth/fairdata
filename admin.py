from django.contrib import admin
from fairdata.models import Uploaded_File, file_destination

class FileAdmin(admin.ModelAdmin):
    fields = ['generated_id','uploaded_file']
    list_display = ('generated_id','uploaded_file')

admin.site.register(Uploaded_File, FileAdmin)
