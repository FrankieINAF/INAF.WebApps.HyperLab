using System.Text;
using System.Text.Json;

namespace INAF.WebApps.HyperLab.Helpers
{
    public static class SessionExtensions
    {
        public static bool ContainsKey(this ISession session, string key)
        {
            return session.Keys.Any(x => x.Equals(key));
        }

        #region OBJECT
        public static T? GetObject<T>(this ISession session, string key)
        {
            var value = session.Get(key);
            if (value == null)
            {
                return default(T);
            }
            string json = Encoding.UTF8.GetString(value);
            return value == null ? default(T) : JsonSerializer.Deserialize<T>(json);
        }

        public static void SetObject<T>(this ISession session, string key, T value)
        {
            string json = JsonSerializer.Serialize(value);
            session.Set(key, Encoding.UTF8.GetBytes(json));
        }
        #endregion

        #region BOOLEAN
        public static bool? GetBoolean(this ISession session, string key)
        {
            var data = session.Get(key);
            if (data == null)
            {
                return null;
            }
            return BitConverter.ToBoolean(data, 0);
        }

        public static void SetBoolean(this ISession session, string key, bool value)
        {
            session.Set(key, BitConverter.GetBytes(value));
        }
        #endregion

        #region DOUBLE
        public static double? GetDouble(this ISession session, string key)
        {
            var data = session.Get(key);
            if (data == null)
            {
                return null;
            }
            return BitConverter.ToDouble(data, 0);
        }

        public static void SetDouble(this ISession session, string key, double value)
        {
            session.Set(key, BitConverter.GetBytes(value));
        }
        #endregion

        #region STRING
        public static string? GetString(this ISession session, string key)
        {
            var data = session.Get(key);
            if (data == null)
            {
                return null;
            }
            return BitConverter.ToString(data, 0);
        }

        public static void SetString(this ISession session, string key, string value)
        {
            session.Set(key, Encoding.UTF8.GetBytes(value));
        }
        #endregion
    }
}
