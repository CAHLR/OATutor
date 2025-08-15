import Tooltip from "@material-ui/core/Tooltip";
import { withStyles } from "@material-ui/core/styles";

export const ProgressTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: "rgba(97,97,97,0.9)",
    color: "#fff",
    padding: 16,
    borderRadius: 6,
    width: 280,              // fixed width per spec
    maxWidth: 280,
    boxSizing: "border-box", // ✅ include padding in the 280px
    fontFamily: theme.typography.fontFamily,
    boxShadow: "none",
  },
  arrow: { color: "rgba(97,97,97,0.9)" },
}))(Tooltip);

export const InfoTooltip = withStyles(() => ({
  tooltip: { backgroundColor: "rgba(97,97,97,0.9)", color:"#fff", padding:12, borderRadius:6, maxWidth:240, fontFamily:"Inter, sans-serif", boxShadow:"none" },
  arrow: { color: "rgba(97,97,97,0.9)" },
}))(Tooltip);