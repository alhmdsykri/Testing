namespace Sera.Common
{
    public enum ResponseStatus
    {
        FAIL = 0,
        SUCCESS = 1
    }

    public enum PermissionStatus
    {
        INACTIVE = 0,
        ACTIVE = 1,
        NOFOUND = 3
    }

    public enum EventStatus
    {
        DELETED = 0,
        INPROGRESS = 1,
        COMPLETED = 2,
        FAIL = 3,
        REJECTED = 9
    }
    public enum FirebaseStatus
    {
        INPROGRESS = 0,
        COMPLETED = 1,
    }

    public enum CompletionStatus
    {
        INACTIVE = 0,
        COMPLETED = 1,
        INPROGRESS = 2,
        INCOMPLETED = 3,
        PENDING_APPROVAL = 4,
        REJECTED = 9
    }
}
