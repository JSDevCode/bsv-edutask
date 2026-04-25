import pytest
import pymongo
from datetime import datetime
from bson.objectid import ObjectId

from src.util.dao import DAO


# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
#        Fixtures
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

@pytest.fixture
def task_dao():
    """
    Create a fresh DAO for the task collection.

    The collection is dropped before each test and recreated through DAO("task"),
    so that every test starts from a known empty state with the validator applied.
    """
    dao = DAO("task")
    dao.drop()

    dao = DAO("task")

    yield dao

    dao.drop()


@pytest.fixture
def valid_title():
    return "Valid title"


@pytest.fixture
def valid_description():
    return "Valid Description."


@pytest.fixture
def valid_task_input(valid_title, valid_description):
    return {
        "title": valid_title,
        "description": valid_description
    }


@pytest.fixture
def valid_startdate():
    return datetime(2026, 4, 20, 12, 0, 0)


@pytest.fixture
def valid_duedate():
    return datetime(2026, 4, 21, 12, 0, 0)


@pytest.fixture
def valid_categories():
    return ["one", "two"]


@pytest.fixture
def valid_video_object_id():
    """
    Code-side representative for the table's placeholder video ObjectId.

    The table uses a readable placeholder like ObjectId("video123uniqueHashID"),
    but executable code must use a real 24-character hexadecimal ObjectId.
    """
    return ObjectId("aaaaaaaaaaaaaaaaaaaaaaaa")


@pytest.fixture
def valid_requires():
    """
    Code-side representative for the table's placeholder requires ObjectId.
    """
    return [ObjectId("bbbbbbbbbbbbbbbbbbbbbbbb")]


@pytest.fixture
def valid_todos():
    """
    Code-side representative for the table's placeholder todos ObjectId.
    """
    return [ObjectId("cccccccccccccccccccccccc")]


# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
#        Required fields
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

@pytest.mark.integration
def test_create_minimal_valid_task(valid_task_input, task_dao):
    result = task_dao.create(valid_task_input)

    assert "_id" in result
    assert result["title"] == valid_task_input["title"]
    assert result["description"] == valid_task_input["description"]
    assert task_dao.collection.count_documents({}) == 1


@pytest.mark.integration
def test_create_missing_title(valid_task_input, task_dao):
    invalid_task_input = {
        "description": valid_task_input["description"]
    }

    before_count = task_dao.collection.count_documents({})

    with pytest.raises(pymongo.errors.WriteError):
        task_dao.create(invalid_task_input)

    assert task_dao.collection.count_documents({}) == before_count


@pytest.mark.integration
def test_create_missing_description(valid_task_input, task_dao):
    invalid_task_input = {
        "title": valid_task_input["title"]
    }

    before_count = task_dao.collection.count_documents({})

    with pytest.raises(pymongo.errors.WriteError):
        task_dao.create(invalid_task_input)

    assert task_dao.collection.count_documents({}) == before_count


@pytest.mark.integration
def test_create_invalid_title_type_boolean(valid_task_input, task_dao):
    invalid_task_input = valid_task_input.copy()
    invalid_task_input["title"] = False

    before_count = task_dao.collection.count_documents({})

    with pytest.raises(pymongo.errors.WriteError):
        task_dao.create(invalid_task_input)

    assert task_dao.collection.count_documents({}) == before_count


@pytest.mark.integration
def test_create_invalid_title_type_int(valid_task_input, task_dao):
    invalid_task_input = valid_task_input.copy()
    invalid_task_input["title"] = 1

    before_count = task_dao.collection.count_documents({})

    with pytest.raises(pymongo.errors.WriteError):
        task_dao.create(invalid_task_input)

    assert task_dao.collection.count_documents({}) == before_count


@pytest.mark.integration
def test_create_invalid_description_type_date(valid_task_input, valid_startdate, task_dao):
    invalid_task_input = valid_task_input.copy()
    invalid_task_input["description"] = valid_startdate

    before_count = task_dao.collection.count_documents({})

    with pytest.raises(pymongo.errors.WriteError):
        task_dao.create(invalid_task_input)

    assert task_dao.collection.count_documents({}) == before_count


@pytest.mark.integration
def test_create_invalid_description_type_list(valid_task_input, task_dao):
    invalid_task_input = valid_task_input.copy()
    invalid_task_input["description"] = ["Trapped in list"]

    before_count = task_dao.collection.count_documents({})

    with pytest.raises(pymongo.errors.WriteError):
        task_dao.create(invalid_task_input)

    assert task_dao.collection.count_documents({}) == before_count


# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
#        Optional fields
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

@pytest.mark.integration
def test_create_valid_startdate(valid_task_input, valid_startdate, task_dao):
    task_input = valid_task_input.copy()
    task_input["startdate"] = valid_startdate

    result = task_dao.create(task_input)

    assert "_id" in result
    assert task_dao.collection.count_documents({}) == 1


@pytest.mark.integration
def test_create_invalid_startdate_type(valid_task_input, task_dao):
    invalid_task_input = valid_task_input.copy()
    invalid_task_input["startdate"] = "2026-04-20"

    before_count = task_dao.collection.count_documents({})

    with pytest.raises(pymongo.errors.WriteError):
        task_dao.create(invalid_task_input)

    assert task_dao.collection.count_documents({}) == before_count


@pytest.mark.integration
def test_create_valid_duedate(valid_task_input, valid_duedate, task_dao):
    task_input = valid_task_input.copy()
    task_input["duedate"] = valid_duedate

    result = task_dao.create(task_input)

    assert "_id" in result
    assert task_dao.collection.count_documents({}) == 1


@pytest.mark.integration
def test_create_invalid_duedate_type(valid_task_input, task_dao):
    invalid_task_input = valid_task_input.copy()
    invalid_task_input["duedate"] = "2026-04-21"

    before_count = task_dao.collection.count_documents({})

    with pytest.raises(pymongo.errors.WriteError):
        task_dao.create(invalid_task_input)

    assert task_dao.collection.count_documents({}) == before_count


@pytest.mark.integration
def test_create_valid_categories_array(valid_task_input, valid_categories, task_dao):
    task_input = valid_task_input.copy()
    task_input["categories"] = valid_categories

    result = task_dao.create(task_input)

    assert "_id" in result
    assert result["categories"] == valid_categories
    assert task_dao.collection.count_documents({}) == 1


@pytest.mark.integration
def test_create_valid_empty_categories_array(valid_task_input, task_dao):
    task_input = valid_task_input.copy()
    task_input["categories"] = []

    result = task_dao.create(task_input)

    assert "_id" in result
    assert result["categories"] == []
    assert task_dao.collection.count_documents({}) == 1


@pytest.mark.integration
def test_create_invalid_categories_array_item_type(valid_task_input, task_dao):
    invalid_task_input = valid_task_input.copy()
    invalid_task_input["categories"] = [1, 2]

    before_count = task_dao.collection.count_documents({})

    with pytest.raises(pymongo.errors.WriteError):
        task_dao.create(invalid_task_input)

    assert task_dao.collection.count_documents({}) == before_count


@pytest.mark.integration
def test_create_valid_video_object_id(valid_task_input, valid_video_object_id, task_dao):
    task_input = valid_task_input.copy()
    task_input["video"] = valid_video_object_id

    result = task_dao.create(task_input)

    assert "_id" in result
    assert result["video"]["$oid"] == str(valid_video_object_id)
    assert task_dao.collection.count_documents({}) == 1


@pytest.mark.integration
def test_create_invalid_video_type_string(valid_task_input, task_dao):
    invalid_task_input = valid_task_input.copy()
    invalid_task_input["video"] = "video123uniqueIDString"

    before_count = task_dao.collection.count_documents({})

    with pytest.raises(pymongo.errors.WriteError):
        task_dao.create(invalid_task_input)

    assert task_dao.collection.count_documents({}) == before_count


# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
#        Additional misc cases
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

@pytest.mark.integration
def test_create_valid_full_task_object(
    valid_task_input,
    valid_startdate,
    valid_duedate,
    valid_categories,
    valid_requires,
    valid_todos,
    valid_video_object_id,
    task_dao
):
    task_input = valid_task_input.copy()
    task_input["startdate"] = valid_startdate
    task_input["duedate"] = valid_duedate
    task_input["categories"] = valid_categories
    task_input["requires"] = valid_requires
    task_input["todos"] = valid_todos
    task_input["video"] = valid_video_object_id

    result = task_dao.create(task_input)

    assert "_id" in result
    assert result["title"] == task_input["title"]
    assert result["description"] == task_input["description"]
    assert result["categories"] == valid_categories
    assert result["requires"][0]["$oid"] == str(valid_requires[0])
    assert result["todos"][0]["$oid"] == str(valid_todos[0])
    assert result["video"]["$oid"] == str(valid_video_object_id)
    assert task_dao.collection.count_documents({}) == 1


@pytest.mark.integration
def test_create_valid_requires_array(valid_task_input, valid_requires, task_dao):
    task_input = valid_task_input.copy()
    task_input["requires"] = valid_requires

    result = task_dao.create(task_input)

    assert "_id" in result
    assert len(result["requires"]) == 1
    assert result["requires"][0]["$oid"] == str(valid_requires[0])
    assert task_dao.collection.count_documents({}) == 1


@pytest.mark.integration
def test_create_valid_empty_requires_array(valid_task_input, task_dao):
    task_input = valid_task_input.copy()
    task_input["requires"] = []

    result = task_dao.create(task_input)

    assert "_id" in result
    assert result["requires"] == []
    assert task_dao.collection.count_documents({}) == 1


@pytest.mark.integration
def test_create_invalid_requires_array_item_type(valid_task_input, task_dao):
    invalid_task_input = valid_task_input.copy()
    invalid_task_input["requires"] = ["NotAnObjectId"]

    before_count = task_dao.collection.count_documents({})

    with pytest.raises(pymongo.errors.WriteError):
        task_dao.create(invalid_task_input)

    assert task_dao.collection.count_documents({}) == before_count


@pytest.mark.integration
def test_create_valid_todos_array(valid_task_input, valid_todos, task_dao):
    task_input = valid_task_input.copy()
    task_input["todos"] = valid_todos

    result = task_dao.create(task_input)

    assert "_id" in result
    assert len(result["todos"]) == 1
    assert result["todos"][0]["$oid"] == str(valid_todos[0])
    assert task_dao.collection.count_documents({}) == 1


@pytest.mark.integration
def test_create_valid_empty_todos_array(valid_task_input, task_dao):
    task_input = valid_task_input.copy()
    task_input["todos"] = []

    result = task_dao.create(task_input)

    assert "_id" in result
    assert result["todos"] == []
    assert task_dao.collection.count_documents({}) == 1


@pytest.mark.integration
def test_create_invalid_todos_array_item_type(valid_task_input, task_dao):
    invalid_task_input = valid_task_input.copy()
    invalid_task_input["todos"] = ["StringHashId"]

    before_count = task_dao.collection.count_documents({})

    with pytest.raises(pymongo.errors.WriteError):
        task_dao.create(invalid_task_input)

    assert task_dao.collection.count_documents({}) == before_count


# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
#        Supplemental failing test
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


@pytest.mark.integration
def test_create_duplicate_title_rejected_by_validator_assumption(task_dao):
    """
    Supplementary discrepancy test.

    This test is intentionally based on the reading that the validator's
    uniqueItems on title should safeguard title uniqueness across documents.
    If that assumption were correct, the second insert should be rejected.

    In practice, this test is expected to fail, which helps expose that the
    validator does not actually enforce cross-document uniqueness for the title string
    field through the misapplied uniqueItems-constraint.
    """
    first_task = {
        "title": "Duplicate title",
        "description": "First description."
    }

    second_task = {
        "title": "Duplicate title",
        "description": "Second description."
    }

    first_result = task_dao.create(first_task)
    assert "_id" in first_result

    with pytest.raises(pymongo.errors.WriteError):
        task_dao.create(second_task)