import Article from "@/partials/article/article";

import styles from "news-site-css/dist/layout.module.css";

export default function Section({ section }) {
    return (
        <>
            {section.name
                ? <div id={section.id} className={styles["row-header"]}>
                    <h2>{section.name}</h2>
                </div>
                : null}
            <section className={styles.row}>
                {section.articles.map((article) =>
                    <Article key={article.id} article={article} />
                )}
            </section>
        </>
    );
}
