# get-posters utility
# loads fimls from ghibliapi.herokuapp.com and find posters for the loaded films
# the utility uses Bing Search API key
# the key must be specified through the BING_SEARCH_API_KEY environment variable
# you can get your key using the following url: https://azure.microsoft.com/en-us/try/cognitive-services/
#
# usage (from powershell):
# $env:BING_SEARCH_API_KEY="your-api-key-here"; .\get-posters.py
#
# the result can be inserted into poster.ts file

import os
import urllib.request, urllib.parse, json

films_url = "https://ghibliapi.herokuapp.com/films"
search_url = "https://api.cognitive.microsoft.com/bing/v7.0/images/search"

# Please specify the Bing search API key in the environment variable
subscription_key = os.environ['BING_SEARCH_API_KEY']
headers = {"Ocp-Apim-Subscription-Key" : subscription_key}

with urllib.request.urlopen(films_url) as url:
    data = json.loads(url.read().decode())
    for film in data:
        params  = {"q": film['title'] + ' poster'}
        request = urllib.request.Request(search_url + '?%s' % urllib.parse.urlencode(params), headers=headers)
        with urllib.request.urlopen(request) as searchUrl:
            searchResult = json.loads(searchUrl.read().decode())
            print("'{0}': '{1}'".format(film['title'].replace('\'', '\\\''), searchResult['value'][0]['thumbnailUrl']))