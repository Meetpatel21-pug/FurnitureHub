from unittest.mock import patch

from django.test import SimpleTestCase, override_settings
from rest_framework.test import APIRequestFactory

from .views import OUT_OF_SCOPE_CHAT_REPLY, chat_with_furnibot


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

    @patch('store.views.urlopen')
    @override_settings(XAI_API_KEY='test-key')
    def test_chat_rejects_non_furniture_messages_before_calling_ai(self, mock_urlopen):
        request = self.factory.post(
            '/api/ai/chat/',
            {'message': 'Who won the football match yesterday?'},
            format='json',
        )

        response = chat_with_furnibot(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['reply'], OUT_OF_SCOPE_CHAT_REPLY)
        mock_urlopen.assert_not_called()

    @override_settings(XAI_API_KEY='')
    def test_chat_gives_specific_fallback_for_sofa_material_comparison(self):
        request = self.factory.post(
            '/api/ai/chat/',
            {'message': 'Which sofa is better: leather or cotton fabric?'},
            format='json',
        )

        response = chat_with_furnibot(request)

        self.assertEqual(response.status_code, 200)
        self.assertIn('easy cleanup', response.data['reply'].lower())
