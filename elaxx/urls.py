from django.conf.urls import url, include, patterns
from django.contrib import admin
import settings

admin.autodiscover()

urlpatterns = patterns('',
    # Example:

    # Uncomment this for admin:
    #(r'^admin/', include('django.contrib.admin.urls')),
    url('^admin/', include(admin.site.urls)),
    #('^blog/', include('blog.urls')),
    url('^mail/', include('elaxxnew.mail.urls')),
    #(r'^site_media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': '/path/to/media', 'show_indexes': True}),
    url('^site_media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT}),
    url('^accounts/login/$', 'django.contrib.auth.views.login', {'template_name': 'admin/login.html'}),
)