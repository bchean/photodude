def catch_exception_and_return_err_dict(function):
    def wrapper(*args, **kwargs):
        try:
            return function(*args, **kwargs)
        except Exception as e:
            return dict(error=str(e))
    return wrapper
