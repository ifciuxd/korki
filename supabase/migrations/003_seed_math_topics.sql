-- 003_seed_math_topics.sql
-- Statyczne działy matematyki

INSERT INTO math_topics (slug, name, category, exam_level, display_order) VALUES
-- Arytmetyka (szkoła podstawowa)
('dzialania-na-liczbach', 'Działania na liczbach', 'arytmetyka', 'egzamin8', 1),
('ulamki-zwykle-i-dziesietne', 'Ułamki zwykłe i dziesiętne', 'arytmetyka', 'egzamin8', 2),
('potegi-i-pierwiastki', 'Potęgi i pierwiastki', 'arytmetyka', 'egzamin8', 3),
('procenty', 'Procenty', 'arytmetyka', 'egzamin8', 4),
('proporcje', 'Proporcje', 'arytmetyka', 'egzamin8', 5),

-- Algebra (szkoła podstawowa + liceum)
('wyrazenia-algebraiczne', 'Wyrażenia algebraiczne', 'algebra', 'egzamin8', 10),
('rownania-liniowe', 'Równania liniowe', 'algebra', 'egzamin8', 11),
('uklady-rownan', 'Układy równań', 'algebra', 'egzamin8', 12),
('nierownosci', 'Nierówności', 'algebra', 'egzamin8', 13),
('funkcja-liniowa', 'Funkcja liniowa', 'algebra', 'egzamin8', 14),

-- Algebra (matura podstawowa)
('funkcja-kwadratowa', 'Funkcja kwadratowa', 'algebra', 'matura_podstawowa', 20),
('wielomiany', 'Wielomiany', 'algebra', 'matura_podstawowa', 21),
('funkcja-wykladnicza', 'Funkcja wykładnicza', 'algebra', 'matura_podstawowa', 22),
('logarytmy', 'Logarytmy', 'algebra', 'matura_podstawowa', 23),
('ciagi-arytmetyczne', 'Ciągi arytmetyczne', 'algebra', 'matura_podstawowa', 24),
('ciagi-geometryczne', 'Ciągi geometryczne', 'algebra', 'matura_podstawowa', 25),

-- Algebra (matura rozszerzona)
('funkcje-trygonometryczne', 'Funkcje trygonometryczne', 'algebra', 'matura_rozszerzona', 30),
('rownania-trygonometryczne', 'Równania trygonometryczne', 'algebra', 'matura_rozszerzona', 31),
('liczby-zespolone', 'Liczby zespolone', 'algebra', 'matura_rozszerzona', 32),
('indukcja-matematyczna', 'Indukcja matematyczna', 'algebra', 'matura_rozszerzona', 33),

-- Geometria (szkoła podstawowa)
('figury-plaskie', 'Figury płaskie', 'geometria', 'egzamin8', 40),
('pola-i-obwody', 'Pola i obwody', 'geometria', 'egzamin8', 41),
('twierdzenie-pitagorasa', 'Twierdzenie Pitagorasa', 'geometria', 'egzamin8', 42),
('symetrie-i-przeksztalcenia', 'Symetrie i przekształcenia', 'geometria', 'egzamin8', 43),

-- Geometria (matura podstawowa)
('trygonometria', 'Trygonometria', 'geometria', 'matura_podstawowa', 50),
('geometria-analityczna', 'Geometria analityczna', 'geometria', 'matura_podstawowa', 51),
('bryly', 'Bryły', 'geometria', 'matura_podstawowa', 52),
('pole-powierzchni-i-objetosc', 'Pole powierzchni i objętość', 'geometria', 'matura_podstawowa', 53),

-- Geometria (matura rozszerzona)
('geometria-na-plaszczyznie', 'Geometria na płaszczyźnie (zaawansowana)', 'geometria', 'matura_rozszerzona', 60),
('geometria-przestrzenna', 'Geometria przestrzenna (zaawansowana)', 'geometria', 'matura_rozszerzona', 61),
('przekroje-bryl', 'Przekroje brył', 'geometria', 'matura_rozszerzona', 62),

-- Analiza (matura podstawowa)
('granice-ciągow', 'Granice ciągów', 'analiza', 'matura_podstawowa', 70),

-- Analiza (matura rozszerzona)
('granice-funkcji', 'Granice funkcji', 'analiza', 'matura_rozszerzona', 80),
('pochodne', 'Pochodne', 'analiza', 'matura_rozszerzona', 81),
('calki', 'Całki', 'analiza', 'matura_rozszerzona', 82),
('zastosowania-pochodnych', 'Zastosowania pochodnych', 'analiza', 'matura_rozszerzona', 83),
('zastosowania-calek', 'Zastosowania całek', 'analiza', 'matura_rozszerzona', 84),

-- Rachunek prawdopodobieństwa i statystyka
('kombinatoryka', 'Kombinatoryka', 'statystyka', 'matura_podstawowa', 90),
('prawdopodobienstwo', 'Prawdopodobieństwo', 'statystyka', 'matura_podstawowa', 91),
('statystyka-opisowa', 'Statystyka opisowa', 'statystyka', 'matura_podstawowa', 92),
('prawdopodobienstwo-warunkowe', 'Prawdopodobieństwo warunkowe', 'statystyka', 'matura_rozszerzona', 93);
