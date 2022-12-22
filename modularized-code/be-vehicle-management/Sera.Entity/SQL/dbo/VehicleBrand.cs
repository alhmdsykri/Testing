namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("VehicleBrand", Schema = "dbo")]
    public partial class VehicleBrand
    {
        public VehicleBrand()
        {
            Vehicle = new HashSet<Vehicle>();
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int vehicleBrandId { get; set; }
        public string vehicleBrandCode { get; set; }
        public string vehicleBrandName { get; set; }
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