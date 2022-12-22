namespace Sera.Common
{
    [ExcludeFromCodeCoverage]
    public class Message
    {
        public static string Exception()
        {
            return "There is an error. Please contact your administrator.";
        }

        public static string Exception(string process)
        {
            return $"There is an error on process {process}.";
        }

        public static string Accepted(string module)
        {
            return $"Data {module} has been accepted.";
        }

        public static string Created(string module)
        {
            return $"Data {module} has been created.";
        }

        public static string Found(string module)
        {
            return $"{module} data found.";
        }

        public static string Found(int count, string module)
        {
            if (count <= 0)
            {
                return NotFound(module);
            }

            return $"{count} data {module} found.";
        }

        public static string NotFound(string module)
        {
            return $"{module} data not found.";
        }

        public static string InsertSuccess(string module)
        {
            return $"{module} data saved successfully.";
        }

        public static string InsertFail(string module)
        {
            return $"{module} data failed to save.";
        }

        public static string UpdateSuccess(string module)
        {
            return $"{module} data Updated successfully.";
        }

        public static string UpdateFail(string module)
        {
            return $"{module} data failed to update.";
        }

        public static string DeleteSuccess(string module)
        {
            return $"{module} data deleted successfully.";
        }

        public static string DeleteFail(string module)
        {
            return $"{module} data failed to delete.";
        }

        public static string Empty(string module)
        {
            return $"{module} data cannot be empty.";
        }

        public static string Fail(string process)
        {
            return $"{process} is failed.";
        }

        public static string Success(string process)
        {
            return $"{process} is successful.";
        }

        public static string Unauthorized()
        {
            return $"User unauthorized.";
        }

        public static string Unverified()
        {
            return $"User is not verified.";
        }

        public static string Exist(string module, string key)
        {
            return $"{module} data with Id {key} is already exists.";
        }

        public static string NotExist(string module)
        {
            return $"Could not find {module}.";
        }

        public static string Exist(string module)
        {
            return $"{module} data already exists.";
        }

        public static string SyncSuccess(string module)
        {
            return $"{module} data synced successfully.";
        }

        public static string SyncFail(string module)
        {
            return $"{module} data failed to synced.";
        }

        public static string InvalidEvent()
        {
            return $"Invalid or empty event method.";
        }

        public static string InvalidRegexCode()
        {
            return $"Numbers and letters only please.";
        }

        public static string InvalidReferenceName()
        {
            return $"Invalid vehicle reference name, allowed values is BRAND, CATEGORY, MODEL, COLOR, FUELTYPE";
        }

        public static string InvalidRegexName()
        {
            return $"Numbers, letters, space, point, comma, dash and parentheses only please.";
        }

        public static string ResourceLocking(string module)
        {
            return $"{module} data still in progress on another process or have been deleted";
        }

        public static string UsedValidation(string module)
        {
            return $"Can't update or delete because {module} has been used in another service.";
        }

        public static string VMValidation(string module)
        {
            return $"You cannot delete {module} data originated from VM";
        }

        public static string AllBranch()
        {
            return $"The data branch in this contract is all branch in database.";
        }

        public static string ALLBranchValidation(string module)
        {
            return $"Material {module} should not be all branch if there is more than one contract item.";
        }

        public static string CanAddContract()
        {
            return $"Can not add more than 10 contract.";
        }

        public static string MaterialDuplicate(string module)
        {
            return $"Material {module} with this detail is duplicated.";
        }
        public static string MaterialDuplicateInDB(string module)
        {
            return $"Material {module} with this detail already existed.";
        }

        public static string ExpenseDuplicate(string module)
        {
            return $"Expense {module} with this detail is duplicated.";
        }

        public static string ExpenseDuplicateInDB(string module)
        {
            return $"Expense {module} with this detail already existed.";
        }
        public static string CategoryGreaterZero()
        {
            return $"One of the categories must be greater than zero.";
        }
        public static string FmsValidation(string module)
        {
            return $"You cannot delete {module} data Source From Not FMS";
        }

    }
}
