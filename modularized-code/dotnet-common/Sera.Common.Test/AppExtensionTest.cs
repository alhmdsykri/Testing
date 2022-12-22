using Sera.Common.Extension;
using System.Runtime.Serialization;
using System.Text;

namespace Sera.Common.Test
{
    public class AppExtensionTest
    {
        [Fact]
        public void IsEmptyTest()
        {
            var coll = new List<string> { "1", "2", "3" };
            var result = coll.IsEmpty();

            Assert.True(!result);
        }

        [Fact]
        public void RemoveLFCRTest()
        {
            StringBuilder sample = new();
            sample.Append(@"Sample text ");
            sample.Append(Environment.NewLine);
            sample.Append("to be tested");

            var result = sample.ToString().RemoveLFCR();

            Assert.Equal("Sample text to be tested", result);
        }

        [Fact]
        public void IsNumericTypeTest()
        {
            double sample = 100;
            var result = sample.IsNumericType();

            Assert.True(result);
        }

        [Fact]
        public void IsNotNumericTypeTest()
        {
            string sample = "100";
            var result = sample.IsNumericType();

            Assert.False(result);
        }

        [Fact]
        public void IsEqualTest()
        {
            string a = "SaMPle";
            string b = "sample";

            var result = a.IsEqual(b);

            Assert.True(result);
        }

        [Fact]
        public void AddSpacesToSentenceTest()
        {
            string sample = "ThisIsSampleTestString";
            string result = sample.AddSpacesToSentence(false);

            Assert.Equal("This Is Sample Test String", result);
        }

        [Fact]
        public void SerializeTest()
        {
            DateTime dob = new DateTime(1990, 01, 01);
            EmployeeJSON data = new()
            {
                Department = "Research and Development",
                NRP = 8051,
                Profile = new SampleJSON()
                {
                    Age = DateTime.Now.Year - dob.Year,
                    DateOfBirth = dob,
                    FirstName = "Senjayanto",
                    Height = 170.5,
                    Hobbies = new List<string> { "Gaming", "Motorcycle Racing" },
                    IsPermanent = true,
                    LastName = "Abadi",
                    Weight = 80.3
                }
            };

            string result = data.Serialize();

            Assert.True(!string.IsNullOrWhiteSpace(result));
        }

        [Fact]
        public void PrettySerializeTest()
        {
            DateTime dob = new DateTime(1990, 01, 01);
            EmployeeJSON data = new()
            {
                Department = "Research and Development",
                NRP = 8051,
                Profile = new SampleJSON()
                {
                    Age = DateTime.Now.Year - dob.Year,
                    DateOfBirth = dob,
                    FirstName = "Senjayanto",
                    Height = 170.5,
                    Hobbies = new List<string> { "Gaming", "Motorcycle Racing" },
                    IsPermanent = true,
                    LastName = "Abadi",
                    Weight = 80.3
                }
            };

            string result = data.Serialize(isPretty: true);

            Assert.True(!string.IsNullOrWhiteSpace(result));
        }

        [Fact]
        public void DeserializeTest()
        {
            string json = "{\"nrp\":8051,\"department\":\"Research and Development\",\"profile\":{\"firstName\":\"Senjayanto\",\"lastName\":\"Abadi\",\"dateOfBirth\":\"1990-01-01T00:00:00\",\"age\":32,\"height\":170.5,\"weight\":80.3,\"isPermanent\":true,\"hobbies\":[\"Gaming\",\"Motorcycle Racing\"]}}";
            EmployeeJSON result = json.Deserialize<EmployeeJSON>();

            Assert.True(result != null);
        }
    }
    public class EmployeeJSON
    {
        [DataMember(Name = "nrp")]
        public int NRP { get; set; }
        public string Department { get; set; }
        public SampleJSON Profile { get; set; }
    }

    public class SampleJSON
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public int Age { get; set; }
        public double Height { get; set; }
        public double Weight { get; set; }
        public bool IsPermanent { get; set; }
        public List<string> Hobbies { get; set; }
    }
}
