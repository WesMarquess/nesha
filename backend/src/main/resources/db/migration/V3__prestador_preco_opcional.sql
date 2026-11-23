-- O cadastro do prestador (tela cadastro-prestador) não pede preço: ele é definido depois,
-- em configuracoes-servico-prestador. Até lá o perfil fica sem preço.
ALTER TABLE prestador_perfil ALTER COLUMN preco DROP NOT NULL;
