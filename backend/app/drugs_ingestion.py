import pandas as pd
from backend.app.models import Drug
from backend.app.database import SessionLocal
from sqlalchemy.orm import Session


def load_drugs_data(file_path: str):
    df = pd.read_csv(file_path)

    drugs = []
    for _, row in df.iterrows():
        try:
            usage = row["Usage"] if pd.notnull(row["Usage"]) else "No usage information available"
            warnings = row["Warnings"] if pd.notnull(row["Warnings"]) else "No warnings available"
            side_effects = row["Side Effects"] if pd.notnull(row["Side Effects"]) else "No side effects listed"
            drug_class = row["Drug Class"] if pd.notnull(row["Drug Class"]) else "Unknown"
            generic_name = row["Generic Name"] if pd.notnull(row["Generic Name"]) else "Unknown"

            drug = Drug(
                drug_id=row["Drug ID"],
                name=row["Drug Name"],
                usage=usage,
                warnings=warnings,
                side_effects=side_effects,
                drug_class=drug_class,
                generic_name=generic_name
            )
            drugs.append(drug)
        except Exception as e:
            print(f"Error processing row {row['Drug ID']}: {e}")

    db: Session = SessionLocal()
    try:
        db.add_all(drugs)
        db.commit()
        print(f"{len(drugs)} drugs have been successfully imported.")
    except Exception as e:
        db.rollback()
        print(f"An error occurred: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    csv_file_path = "../data/csv/drugs_data_final.csv"
    load_drugs_data(csv_file_path)
