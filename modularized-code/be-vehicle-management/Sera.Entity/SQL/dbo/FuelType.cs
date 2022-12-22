namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("FuelType", Schema = "dbo")]
    public partial class FuelType
    {
        public FuelType()
        {
            Vehicle = new HashSet<Vehicle>();
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int fuelTypeId { get; set; }
        public string fuelTypeCode { get; set; }
        public string fuelTypeName { get; set; }
        public int status { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }
        public int version { get; set; }
        public string uniqueKey { get; set; }

        public virtual ICollection<Vehicle> Vehicle { get; set; }
    }
}