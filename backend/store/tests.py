from unittest.mock import patch

from django.test import SimpleTestCase, override_settings
from rest_framework.test import APIRequestFactory

from .views import chat_with_furnibot


class ChatBotFallbackTests(SimpleTestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

    @override_settings(XAI_API_KEY='')
    def test_chat_returns_local_fallback_when_xai_is_unconfigured(self):
        request = self.factory.post(
            '/api/ai/chat/',
            {'message': 'Best sofas for small rooms?'},
            format='json',
        )

        response = chat_with_furnibot(request)

        self.assertEqual(response.status_code, 200)
        self.assertIn('FurniBot', response.data['reply'])
        self.assertIn('sofa', response.data['reply'].lower())

    @patch('store.views.urlopen', side_effect=Exception('service unavailable'))
    @override_settings(XAI_API_KEY='test-key')
    def test_chat_returns_local_fallback_when_xai_service_fails(self, _mock_urlopen):
        request = self.factory.post(
            '/api/ai/chat/',
            {'message': 'What is your delivery policy?'},
            format='json',
        )

        response = chat_with_furnibot(request)

        self.assertEqual(response.status_code, 200)
        self.assertIn('delivery', response.data['reply'].lower())
