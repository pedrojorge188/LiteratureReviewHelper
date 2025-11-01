
import { Document } from "./Document";
import { IListDocuments } from "./types";

export const ListDocuments = (props: IListDocuments) => {
  const { documents, variant = "primary" } = props;
  //variant is used to make changes/modify the section, in css just need to insert the new class to make the changes like documents-section--"nameYouSend"
  return (
    <>
      {documents && documents.length > 0 && (
        <section className={`margin-bottom--generic documents-section documents-section--${variant}`}>
          <ul className="document">
            {documents.map((doc: any, index: number) => {
              return (
                <li key={index} className="accordion-anim">
                  <Document document={doc} dateCol={false} />
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
};
