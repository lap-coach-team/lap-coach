LATEXMK = latexmk -xelatex -interaction=nonstopmode -halt-on-error

.PHONY: all pdf notes speech clean

all: pdf notes speech

# Слайди -> main.pdf
pdf:
	$(LATEXMK) main.tex

# Слайди з нотатками доповідача на другому екрані -> main-notes.pdf
notes:
	$(LATEXMK) main-notes.tex

# Текст виступу для друку -> speech.pdf
speech:
	$(LATEXMK) speech.tex

# Прибрати проміжні файли (PDF лишаються)
clean:
	latexmk -c main.tex main-notes.tex speech.tex
	rm -f *.xdv *.nav *.snm *.vrb *.synctex.gz
