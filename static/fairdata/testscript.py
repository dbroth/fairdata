from fairdata.models import Uploaded_File

def run():
	all_uploads = Uploaded_File.objects.all()
	print all_uploads
