import BrandMark from "../BrandMark";
import studentArtwork from "../../../images/portal-student.webp";
import adminArtwork from "../../../images/portal-admin.webp";

export default function PortalArtwork({
    role = "student",
    brand = "بنك الأسئلة",
    tagline = "تعلّم بثقة",
    children,
}) {
    return (
        <div
            className="qb-art"
            style={{
                "--qb-card-art": `url("${role === "student" ? studentArtwork : adminArtwork}")`,
            }}
        >
            <div className="qb-art-brand" aria-hidden="true">
                <BrandMark inverse />
                <strong>{brand}</strong>
                <span>{tagline}</span>
            </div>
            {children}
        </div>
    );
}
