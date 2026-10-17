def test_circleci_should_catch_this_failure():
    expected = "completed"
    actual = "pending"

    assert actual == expected, "Intentional CI failure demonstration"
