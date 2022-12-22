namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("ActionDetail", Schema = "dbo")]
    public partial class ActionDetail
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RouteActionDetailId { get; set; }
        public int RouteActionId { get; set; }
        public int RouteChildAction { get; set; }
        public int status { get; set; }
        public string uniqueKey { get; set; }
        public int version { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }
        [ForeignKey("RouteActionId")]
        public RouteAction RouteAction { get; set; }
        [ForeignKey("RouteChildAction")]
        public RouteAction RouteActionDetail { get; set; }
    }
}