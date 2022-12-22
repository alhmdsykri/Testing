namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("UOM", Schema = "dbo")]
    public partial class UOM
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string uomCode { get; set; }
        public string uomName { get; set; }
        public int status { get; set; }
        public string uniqueKey { get; set; }
        public int version { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }
    }
}