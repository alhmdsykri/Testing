namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("VehicleColor", Schema = "dbo")]
    public partial class VehicleColor
    {
        public VehicleColor()
        {
            Vehicle = new HashSet<Vehicle>();
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int vehicleColorId { get; set; }
        public string vehicleColorCode { get; set; }
        public string vehicleColorName { get; set; }
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