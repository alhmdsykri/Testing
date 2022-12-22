using System.Text;
using System.Text.RegularExpressions;
using Utf8Json.Resolvers;

namespace Sera.Common.Extension
{
    public static class AppExtension
    {
        /// <summary>
        /// Serialize class object into JSON string
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="model"></param>
        /// <returns></returns>
        public static string Serialize<T>(this T model, bool isPretty = false)
        {
            string result;
            if (isPretty)
            {
                var json = Utf8Json.JsonSerializer.Serialize(model, StandardResolver.CamelCase);
                result = Utf8Json.JsonSerializer.PrettyPrint(json);

                return result;
            }

            result = Utf8Json.JsonSerializer.ToJsonString(model, StandardResolver.CamelCase);

            return result;
        }

        /// <summary>
        /// Deserialize string into class object
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="json"></param>
        /// <returns></returns>
        public static T Deserialize<T>(this string json)
        {
            T result;
            result = Utf8Json.JsonSerializer.Deserialize<T>(json, StandardResolver.CamelCase);

            return result;
        }

        public static string AddSpacesToSentence(this string text, bool preserveAcronyms)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                return string.Empty;
            }

            StringBuilder newText = new(text.Length * 2);

            newText.Append(text[0]);

            for (int i = 1; i < text.Length; i++)
            {
                if (char.IsUpper(text[i]))
                    if ((text[i - 1] != ' ' && !char.IsUpper(text[i - 1])) ||
                        (preserveAcronyms && char.IsUpper(text[i - 1]) &&
                         i < text.Length - 1 && !char.IsUpper(text[i + 1])))
                        newText.Append(' ');
                newText.Append(text[i]);
            }

            return newText.ToString();
        }

        public static string AddSemicolonToSentence(this string text)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                return string.Empty;
            }

            StringBuilder newText = new(text.Length * 2);

            newText.Append(text[0]);

            for (int i = 1; i < text.Length; i++)
            {
                if (char.IsUpper(text[i]))
                    if ((text[i - 1] != ' ' && !char.IsUpper(text[i - 1])) ||
                        (char.IsUpper(text[i - 1]) &&
                         i < text.Length - 1 && !char.IsUpper(text[i + 1])))
                        newText.Append(';');
                newText.Append(text[i]);
            }

            return newText.ToString();
        }

        /// <summary>
        /// Compare two string using OrdinalIgnoreCase
        /// </summary>
        /// <param name="text"></param>
        /// <param name="comparer"></param>
        /// <returns></returns>
        public static bool IsEqual(this string text, string comparer)
        {
            if (text.Equals(comparer, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            return false;
        }

        public static bool IsNumericType(this object o)
        {
            switch (Type.GetTypeCode(o.GetType()))
            {
                case TypeCode.Byte:
                case TypeCode.SByte:
                case TypeCode.UInt16:
                case TypeCode.UInt32:
                case TypeCode.UInt64:
                case TypeCode.Int16:
                case TypeCode.Int32:
                case TypeCode.Int64:
                case TypeCode.Decimal:
                case TypeCode.Double:
                case TypeCode.Single:
                    return true;
                default:
                    return false;
            }
        }

        /// <summary>
        /// Remove line feed and carriage return from string
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        public static string RemoveLFCR(this string text)
        {
            RegexOptions options = RegexOptions.None;
            Regex regex = new("[ ]{2,}", options);

            string result = text.Replace(@"\\", string.Empty);
            result = text.Replace(Environment.NewLine, string.Empty);
            result = regex.Replace(result, " ");

            return result;
        }

        /// <summary>
        /// Check if IEnumerable is null or contains any elements. 
        /// </summary>
        /// <typeparam name="TSource"></typeparam>
        /// <param name="source"></param>
        /// <returns></returns>
        public static bool IsEmpty<TSource>(this IEnumerable<TSource> source)
        {
            if (source == null || !source.Any())
            {
                return true;
            }

            return false;
        }
    }
}
