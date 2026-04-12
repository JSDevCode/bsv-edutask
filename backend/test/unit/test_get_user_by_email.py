import pytest
import unittest.mock as mock
from src.controllers.usercontroller import UserController


@pytest.fixture
def usercontroller():
    mocked_dao = mock.MagicMock()
    user_controller = UserController(mocked_dao)
    return user_controller

@pytest.fixture
def correct_email_input():
    return 'hello@hotmail.com'

@pytest.fixture
def wrong_email_format():
    return 'hello.com'

@pytest.fixture
def email_not_found():
    return 'hi@hotmail.com'

@pytest.mark.unit
def test_get_user_by_email_invalid(wrong_email_format, usercontroller):
    with pytest.raises(ValueError):
        usercontroller.get_user_by_email(wrong_email_format)

@pytest.mark.unit
def test_get_user_by_email_not_found(email_not_found, usercontroller):
        usercontroller.dao.find.return_value = []
        result = usercontroller.get_user_by_email(email_not_found)
        assert result is None

@pytest.mark.unit
def test_get_user_by_email_valid(correct_email_input, usercontroller):
        usercontroller.dao.find.return_value = ['user_1']
        result = usercontroller.get_user_by_email(correct_email_input)
        assert result == 'user_1'

@pytest.mark.unit
def test_get_user_by_email_duplicate_warning(correct_email_input, usercontroller, capsys):
        usercontroller.dao.find.return_value = ['user_1', 'user_2', 'user_3']
        usercontroller.get_user_by_email(correct_email_input)
        # captures everything printed
        captured = capsys.readouterr()
        # captured.out gives the actual printed text
        assert f'Error: more than one user found with mail {correct_email_input}' in captured.out

@pytest.mark.unit
def test_get_user_by_email_duplicate_first_user(correct_email_input, usercontroller):
        usercontroller.dao.find.return_value = ['user_1', 'user_2', 'user_3']
        result = usercontroller.get_user_by_email(correct_email_input)
        assert result == 'user_1'

@pytest.mark.unit
def test_get_user_by_email_dao_exception(correct_email_input, usercontroller):
        # Mock DAO to throw an exception when the find-method is called
        usercontroller.dao.find.side_effect = Exception
        with pytest.raises(Exception):
            usercontroller.get_user_by_email(correct_email_input)
