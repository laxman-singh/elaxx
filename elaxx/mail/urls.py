from django.conf.urls import url, patterns

urlpatterns = patterns('elaxxnew.mail.views',
    url(r'^$', 'index'),
    #(r'main/$', 'main'),
    #(r'msglist/(?P<folder_name>.*?)/$', 'msglist'),
    url(r'msglist/(?P<server>\d+)/(?P<folder>.*?)/(?P<page>.*?)/(?P<perpage>.*?)/(?P<sortc>.*?)/(?P<sortdir>.*?)/(?P<search>.*?)', 'msglist'),
    url(r'viewmsg/(?P<server>\d+)/(?P<folder>.*?)/(?P<uid>\d+)/$', 'viewmsg'),
    url(r'newmail/', 'newmail'),
    url(r'send/$', 'send'),
    url(r'config/(?P<action>.*?)/$', 'config'),
    url(r'json/(?P<action>.*?)/$', 'json'),
    url(r'action/(?P<action>.*?)/$', 'action'),

)
