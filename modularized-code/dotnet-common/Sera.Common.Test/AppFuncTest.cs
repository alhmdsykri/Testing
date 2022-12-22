using Sera.Common.Function;

namespace Sera.Common.Test
{
    public class AppFuncTest
    {
        [Fact]
        public void TimestampeCompositeTest()
        {
            string result = AppFunc.TimestampComposite();
            Assert.True(!string.IsNullOrWhiteSpace(result));
        }
    }
}
