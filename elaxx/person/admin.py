from django.contrib import admin

from elaxxnew.person.models import UserProfile, ImapServer, SmtpServer, Signature

admin.site.register(UserProfile)
admin.site.register(ImapServer)
admin.site.register(SmtpServer)
admin.site.register(Signature)