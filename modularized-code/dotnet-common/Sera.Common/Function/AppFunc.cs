namespace Sera.Common.Function
{
    public static class AppFunc
    {
        /// <summary>
        /// Generate composite unique string that consist of random 8 alphabet characted
        /// combined with UNIX date time format strings.
        /// </summary>
        /// <returns></returns>
        public static string TimestampComposite()
        {
            string result = string.Empty;

            int length = 9;
            Random random = new();

            for (int i = 0; i < length; i++)
            {
                result += ((char)(random.Next(1, 26) + 64)).ToString().ToUpper();
            }

            double strTimestamp = (int)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
            result += strTimestamp.ToString().ToUpper();

            return result;
        }

        public static DateTime FirstDayOfMonth(this DateTime value)
        {
            return new DateTime(value.Year, value.Month, 1);
        }

        public static DateTime LastDayOfMonth(this DateTime value)
        {
            return FirstDayOfMonth(value).AddMonths(1).AddDays(-1);
        }
        public static class CheckFieldMandatory
        {
            public static bool CheckBusinessUnitCode(string arg)
            {
                var isValid = true;

                char[] delimiterChars = { '-', '\t' };
                string[] businessUnitCodeName = arg.Split(delimiterChars);
                int length = businessUnitCodeName.Length;

                if (length < 2)
                {
                    isValid = false;
                }
                else
                {
                    if (businessUnitCodeName[0].Trim(' ').Length > 4)
                    {
                        isValid = false;
                    }
                }

                return isValid;
            }
            public static bool CheckBranchCode(string arg)
            {
                var isValid = true;

                char[] delimiterChars = { '-', '\t' };
                string[] branchCodeName = arg.Split(delimiterChars);
                int length = branchCodeName.Length;

                if (length < 2)
                {
                    isValid = false;
                }
                else
                {
                    if (branchCodeName[0].Trim(' ').Length > 4)
                    {
                        isValid = false;
                    }
                }

                return isValid;
            }
        }

    }
 
}
