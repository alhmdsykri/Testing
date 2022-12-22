namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("Region", Schema = "dbo")]
    public partial class Region
    {
        public Region()
        {
            Branch = new HashSet<Branch>();
        }

        public int regionId { get; set; }
        public string regionName { get; set; }
        public string uniqueKey { get; set; }
        public int status { get; set; }
        public int version { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }

        public ICollection<Branch> Branch { get; set; }
    }
}